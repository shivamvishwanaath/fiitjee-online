import { useState, useEffect, useMemo } from 'react';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '../../firebase';
import { ExamRegistration, RegistrationNote } from '../../types';
import { logActivity } from '../utils/logActivity';
import { getCentreIdByName } from '../utils/centreUtils';

export function useRegistrations(currentCentreName?: string, actorEmail?: string) {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const centreId = currentCentreName ? getCentreIdByName(currentCentreName) : null;

  useEffect(() => {
    if (!centreId) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    const regRef = ref(db, `registrations/big_bang_2026/${centreId}`);
    const unsubscribe = onValue(regRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: ExamRegistration[] = Object.entries(data)
            .filter(([key, val]) => key !== '_init' && val && typeof val === 'object' && (val as any).studentName)
            .map(([key, val]: [string, any]) => ({
              id: key,
              ...val,
              rollNo: val.rollNo || key.replace(/_/g, ' '),
              status: val.status || 'New'
            }));
          
          // Sort newest first
          list.sort((a, b) => {
            const timeA = new Date(a.registeredAt || 0).getTime();
            const timeB = new Date(b.registeredAt || 0).getTime();
            return timeB - timeA;
          });
          
          setRegistrations(list);
        } else {
          setRegistrations([]);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error parsing registrations:', err);
        setError(err.message || 'Failed to read registrations');
        setLoading(false);
      }
    }, (err) => {
      console.error('Firebase onValue error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [centreId]);

  // Compute duplicate phone and email sets
  const { duplicatePhoneSet, duplicateEmailSet } = useMemo(() => {
    const phoneCounts: Record<string, number> = {};
    const emailCounts: Record<string, number> = {};

    registrations.forEach(r => {
      if (r.phone) {
        const p = r.phone.replace(/\D/g, '');
        phoneCounts[p] = (phoneCounts[p] || 0) + 1;
      }
      if (r.email) {
        const e = r.email.toLowerCase().trim();
        emailCounts[e] = (emailCounts[e] || 0) + 1;
      }
    });

    const dupPhones = new Set<string>();
    const dupEmails = new Set<string>();

    Object.entries(phoneCounts).forEach(([p, count]) => {
      if (count > 1) dupPhones.add(p);
    });
    Object.entries(emailCounts).forEach(([e, count]) => {
      if (count > 1) dupEmails.add(e);
    });

    return { duplicatePhoneSet: dupPhones, duplicateEmailSet: dupEmails };
  }, [registrations]);

  // Helper to get sanitized key
  const sanitizeKey = (key: string) => key.replace(/[\s\.\#\$\[\]\/]+/g, '_');

  // CRUD Operations
  const updateRegistration = async (id: string, updates: Partial<ExamRegistration>) => {
    if (!centreId) throw new Error('No centre authenticated');
    const cleanKey = sanitizeKey(id);
    const targetRef = ref(db, `registrations/big_bang_2026/${centreId}/${cleanKey}`);
    const payload = {
      ...updates,
      lastUpdatedBy: actorEmail || 'Centre Admin',
      lastUpdatedAt: new Date().toISOString()
    };
    await update(targetRef, payload);
    if (currentCentreName && actorEmail) {
      await logActivity('UPDATE_REGISTRATION', currentCentreName, actorEmail, id, updates);
    }
  };

  const updateStatus = async (id: string, newStatus: ExamRegistration['status']) => {
    await updateRegistration(id, { status: newStatus });
    if (currentCentreName && actorEmail) {
      await logActivity('UPDATE_STATUS', currentCentreName, actorEmail, id, { status: newStatus });
    }
  };

  const addNote = async (id: string, noteText: string) => {
    const reg = registrations.find(r => r.id === id || r.rollNo === id);
    if (!reg) return;
    const existingNotes = reg.notes || [];
    const newNote: RegistrationNote = {
      text: noteText,
      addedBy: actorEmail || 'Centre Staff',
      addedAt: new Date().toISOString()
    };
    const updatedNotes = [newNote, ...existingNotes];
    await updateRegistration(id, { notes: updatedNotes });
    if (currentCentreName && actorEmail) {
      await logActivity('ADD_NOTE', currentCentreName, actorEmail, id, { text: noteText });
    }
  };

  const addRegistration = async (newReg: ExamRegistration): Promise<string> => {
    if (!centreId) throw new Error('No centre authenticated');
    const rollNo = newReg.rollNo;
    const cleanKey = sanitizeKey(rollNo);
    const targetRef = ref(db, `registrations/big_bang_2026/${centreId}/${cleanKey}`);
    const record: ExamRegistration = {
      ...newReg,
      status: newReg.status || 'New',
      registeredByCentre: currentCentreName || 'Direct Staff',
      registeredAt: newReg.registeredAt || new Date().toISOString()
    };
    await set(targetRef, record);
    if (currentCentreName && actorEmail) {
      await logActivity('CREATE_REGISTRATION', currentCentreName, actorEmail, rollNo, {
        studentName: record.studentName,
        phone: record.phone
      });
    }
    return rollNo;
  };

  const deleteRegistration = async (id: string) => {
    if (!centreId) throw new Error('No centre authenticated');
    const cleanKey = sanitizeKey(id);
    const targetRef = ref(db, `registrations/big_bang_2026/${centreId}/${cleanKey}`);
    await remove(targetRef);
    if (currentCentreName && actorEmail) {
      await logActivity('DELETE_REGISTRATION', currentCentreName, actorEmail, id);
    }
  };

  return {
    registrations,
    loading,
    error,
    duplicatePhoneSet,
    duplicateEmailSet,
    updateRegistration,
    updateStatus,
    addNote,
    addRegistration,
    deleteRegistration
  };
}

