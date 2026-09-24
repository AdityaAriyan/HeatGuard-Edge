import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryRow } from '../database/db';

export const JWT_SECRET = process.env.JWT_SECRET || 'heatguard_edge_super_secret_jwt_key_2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: 'WORKER' | 'USER' | 'CAREGIVER' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}

export function requireRole(roles: Array<'WORKER' | 'USER' | 'CAREGIVER' | 'ADMIN'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` });
      return;
    }
    next();
  };
}

/**
 * Privacy permission check: Verifies if the requester is either the user themselves,
 * an authorized caregiver with active permission, or an admin.
 */
export async function canAccessUserData(requesterId: string, targetUserId: string): Promise<boolean> {
  if (requesterId === targetUserId) return true;

  const requester = await queryRow<{ role: string }>('SELECT role FROM users WHERE id = ?', [requesterId]);
  if (requester?.role === 'ADMIN') return true;

  if (requester?.role === 'CAREGIVER') {
    // Check if caregiver relationship is active and user privacy settings allow caregiver access
    const privacy = await queryRow<{ caregiver_access: number }>(
      'SELECT caregiver_access FROM privacy_settings WHERE user_id = ?',
      [targetUserId]
    );
    if (privacy && privacy.caregiver_access === 0) {
      return false; // User explicitly disabled caregiver access
    }

    const relationship = await queryRow<{ status: string }>(
      'SELECT status FROM caregiver_relationships WHERE user_id = ? AND caregiver_id = ? AND status = "ACTIVE"',
      [targetUserId, requesterId]
    );
    return !!relationship;
  }

  return false;
}
