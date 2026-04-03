"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
/**
 * Middleware to verify Firebase ID tokens from the Authorization header.
 * Expects a Header: Authorization: Bearer <idToken>
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await firebase_1.default.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
