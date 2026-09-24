import { useState, useEffect } from 'react';
import { ref, get, push, set, update, onValue, remove } from 'firebase/database';
import { db } from '../../firebase';
import { CRMInteractionLog, CRMCampaign } from '../../types';
import { logActivity } from '../utils/logActivity';
import { getCentreIdByName } from '../utils/centreUtils';

export function useCRMContacts(actorCentre?: string, actorEmail?: string) {
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState<boolean>(true);

  const centreId = actorCentre ? getCentreIdByName(actorCentre) : null;

  // Subscribe to campaigns for this centre
  useEffect(() => {
    if (!centreId) {
      setCampaigns([]);
      setLoadingCampaigns(false);
      return;
    }

    const campaignsRef = ref(db, `crm_campaigns/${centreId}`);
    const unsubscribe = onValue(campaignsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: CRMCampaign[] = Object.entries(data)
            .filter(([key, val]) => key !== '_init' && val && typeof val === 'object' && (val as any).title)
            .map(([key, val]: [string, any]) => ({
              id: key,
              ...val
            }));
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setCampaigns(list);
        } else {
          setCampaigns([]);
        }
      } catch (err) {
        console.error('Error reading campaigns:', err);
      } finally {
        setLoadingCampaigns(false);
      }
    });

    return () => unsubscribe();
  }, [centreId]);

  const sanitizeKey = (key: string) => key.replace(/[\s\.\#\$\[\]\/]+/g, '_');

  const setStudentFollowUpDate = async (rollNo: string, dateStr: string | null): Promise<void> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const cleanKey = sanitizeKey(rollNo);
      const regRef = ref(db, `registrations/big_bang_2026/${centreId}/${cleanKey}`);
      await update(regRef, {
        followUpDate: dateStr || null,
        lastUpdatedAt: new Date().toISOString(),
        lastUpdatedBy: actorEmail || 'staff'
      });

      await logActivity({
        actorEmail: actorEmail || 'staff@fiitjee.online',
        actorCentre: actorCentre || 'System',
        action: 'UPDATE_REGISTRATION',
        targetRollNo: rollNo,
        details: dateStr ? `Set follow-up reminder for ${dateStr}` : 'Cleared follow-up reminder'
      });
    } catch (err) {
      console.error('Error updating follow-up date:', err);
      throw err;
    }
  };

  const logCRMInteraction = async (
    rollNo: string,
    type: CRMInteractionLog['type'],
    content: string
  ): Promise<void> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const cleanKey = sanitizeKey(rollNo);
      const notesRef = ref(db, `crm_contacts_notes/${centreId}/${cleanKey}`);
      const newRef = push(notesRef);
      const timestamp = new Date().toISOString();

      await set(newRef, {
        rollNo,
        type,
        content,
        by: actorEmail || 'staff@fiitjee.online',
        at: timestamp
      });

      // Update student record lastContactedAt
      const regRef = ref(db, `registrations/big_bang_2026/${centreId}/${cleanKey}`);
      await update(regRef, {
        lastContactedAt: timestamp,
        lastUpdatedBy: actorEmail || 'staff'
      });
    } catch (err) {
      console.error('Error logging CRM interaction:', err);
      throw err;
    }
  };

  const saveCampaign = async (
    data: Omit<CRMCampaign, 'id' | 'createdAt'>
  ): Promise<string> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const campRef = ref(db, `crm_campaigns/${centreId}`);
      const newRef = push(campRef);
      const newId = newRef.key || `CAMP_${Date.now()}`;

      const payload: CRMCampaign = {
        id: newId,
        ...data,
        centreId: actorCentre || 'System',
        createdAt: new Date().toISOString()
      };

      await set(newRef, payload);
      return newId;
    } catch (err) {
      console.error('Error saving campaign:', err);
      throw err;
    }
  };

  const deleteCampaign = async (id: string): Promise<void> => {
    if (!centreId) throw new Error('No centre authenticated');
    try {
      const campRef = ref(db, `crm_campaigns/${centreId}/${id}`);
      await remove(campRef);
    } catch (err) {
      console.error('Error removing campaign:', err);
      throw err;
    }
  };

  return {
    campaigns,
    loadingCampaigns,
    setStudentFollowUpDate,
    logCRMInteraction,
    saveCampaign,
    deleteCampaign
  };
}

