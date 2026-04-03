import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Firebase initialization
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key must be properly escaped if passed directly as a string
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

console.log('🔍 Checking Firebase Env:', { 
  projectId: !!firebaseConfig.projectId, 
  clientEmail: !!firebaseConfig.clientEmail, 
  privateKey: !!firebaseConfig.privateKey 
});

if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey || 
    firebaseConfig.clientEmail.includes('xxxxx')) {
  console.warn('⚠️ Firebase Admin SDK: Service account not fully configured. Some features may not work.');
  console.warn('⚠️ config state:', firebaseConfig.projectId ? 'projectId OK' : 'projectId missing', 
    firebaseConfig.clientEmail ? 'clientEmail OK' : 'clientEmail missing', 
    firebaseConfig.privateKey ? 'privateKey OK' : 'privateKey missing');
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
    });
    console.log('✅ Firebase Admin initialized successfully for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
export const rtdb = admin.apps.length > 0 ? admin.database() : null;
export const storage = admin.apps.length > 0 ? admin.storage() : null;
export default admin;
