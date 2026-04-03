"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.rtdb = exports.auth = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
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
    console.warn('⚠️ config state:', firebaseConfig.projectId ? 'projectId OK' : 'projectId missing', firebaseConfig.clientEmail ? 'clientEmail OK' : 'clientEmail missing', firebaseConfig.privateKey ? 'privateKey OK' : 'privateKey missing');
}
else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
        });
        console.log('✅ Firebase Admin initialized successfully for project:', firebaseConfig.projectId);
    }
    catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
    }
}
exports.db = admin.apps.length > 0 ? admin.firestore() : null;
exports.auth = admin.apps.length > 0 ? admin.auth() : null;
exports.rtdb = admin.apps.length > 0 ? admin.database() : null;
exports.storage = admin.apps.length > 0 ? admin.storage() : null;
exports.default = admin;
