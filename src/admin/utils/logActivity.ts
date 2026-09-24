import { ref, push } from 'firebase/database';
import { db } from '../../firebase';

export interface AdminLogEntry {
  action: string;
  centreId: string;
  centreName: string;
  actorEmail: string;
  targetId?: string;
  details?: Record<string, any> | string;
  timestamp: string;
}

export interface LogActivityParams {
  action: string;
  actorCentre?: string;
  centreName?: string;
  actorEmail?: string;
  targetId?: string;
  targetRollNo?: string;
  details?: Record<string, any> | string;
}

export async function logActivity(
  actionOrParams: string | LogActivityParams,
  centreName?: string,
  actorEmail?: string,
  targetId?: string,
  details?: Record<string, any> | string
): Promise<void> {
  try {
    let action: string;
    let centre: string;
    let email: string;
    let target: string | undefined;
    let det: Record<string, any> | string;

    if (typeof actionOrParams === 'object') {
      action = actionOrParams.action;
      centre = actionOrParams.centreName || actionOrParams.actorCentre || 'System';
      email = actionOrParams.actorEmail || 'staff@fiitjee.online';
      target = actionOrParams.targetRollNo || actionOrParams.targetId;
      det = actionOrParams.details || '';
    } else {
      action = actionOrParams;
      centre = centreName || 'System';
      email = actorEmail || 'staff@fiitjee.online';
      target = targetId;
      det = details || '';
    }

    const cId = centre.toLowerCase().replace(/[^a-z]/g, '') || 'general';
    const logsRef = ref(db, `admin_logs/${cId}`);

    const entry: AdminLogEntry = {
      action,
      centreId: cId,
      centreName: centre,
      actorEmail: email,
      targetId: target,
      details: det,
      timestamp: new Date().toISOString()
    };
    await push(logsRef, entry);
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}

