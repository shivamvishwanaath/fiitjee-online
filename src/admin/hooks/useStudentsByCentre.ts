import { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../firebase';
import { StudentProfile } from '../../types';
import { getCentreIdByName } from '../utils/centreUtils';

export function useStudentsByCentre(actorCentre?: string) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const centreId = actorCentre ? getCentreIdByName(actorCentre) : null;

  useEffect(() => {
    if (!centreId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const indexRef = ref(db, `student_centre_index/${centreId}`);

    const unsubscribe = onValue(indexRef, async (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const uids = Object.keys(snapshot.val());
        const fetchedStudents: StudentProfile[] = [];

        for (const uid of uids) {
          const studentSnap = await get(ref(db, `students/${uid}`));
          if (studentSnap.exists()) {
            fetchedStudents.push({
              uid,
              ...studentSnap.val()
            });
          }
        }

        fetchedStudents.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        setStudents(fetchedStudents);
      } catch (err) {
        console.error('Error fetching centre students:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [centreId]);

  return { students, loading, centreId };
}
