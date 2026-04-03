import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

// Use DecodedIdToken from firebase-admin
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

/**
 * Middleware to verify Firebase ID tokens from the Authorization header.
 * Expects a Header: Authorization: Bearer <idToken>
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
