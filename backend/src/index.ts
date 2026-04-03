import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import admin, { db, rtdb } from './config/firebase';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';
import groq from './config/groq';
import { model as gemini } from './config/gemini';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set up multer for handling media uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit for video/audio frames
});

// ──────────────────────────────────────────────
// Protected Auth Route
// ──────────────────────────────────────────────
app.get('/api/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    uid: req.user?.uid,
    email: req.user?.email,
    name: req.user?.name,
    picture: req.user?.picture,
    emailVerified: req.user?.email_verified,
  });
});

// ──────────────────────────────────────────────
// Proctored Voice Interview Assistant (Gemini 1.5 Multimodal)
// ──────────────────────────────────────────────

/**
 * AI Interview: Turn-by-turn processing with proctoring.
 * Accepts: audio (voice answer), frame (webcam image), resumeText, jobDescription
 */
app.post('/api/ai/interview/turn', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'frame', maxCount: 1 }
]), async (req: AuthenticatedRequest, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const { resumeText, jobDescription, history = "[]" } = req.body;

  try {
    const promptParts: any[] = [
      `You are a professional AI Interviewer and Proctor. 
       Context:
       - Resume: ${resumeText || 'Not provided'}
       - Job Description: ${jobDescription || 'Not provided'}
       - Previous History: ${history}
       
       Tasks:
       1. Analyze the user's spoken answer (audio).
       2. Analyze the user's physical presence (if frame provided). Check for eye contact, movement, or background activity and provide a proctoring update.
       3. Provide the next intelligent follow-up question.
       
       Response Format: JSON strictly with keys: { nextQuestion: string, proctoringScore: number (0-100), proctoringFeedback: string, interviewFeedback: string }`
    ];

    // Add Audio data
    if (files['audio']) {
      promptParts.push({
        inlineData: { data: files['audio'][0].buffer.toString('base64'), mimeType: files['audio'][0].mimetype }
      });
    }

    // Add Video Frame (Proctoring image)
    if (files['frame']) {
      promptParts.push({
        inlineData: { data: files['frame'][0].buffer.toString('base64'), mimeType: files['frame'][0].mimetype }
      });
    }

    const result = await gemini.generateContent(promptParts);
    const response = await result.response;
    const resultJson = JSON.parse(response.text().replace(/```json|```/g, ''));

    // To output voice, frontend uses Web Speech API or separate TTS call.
    // Backend can return the text for speech synthesis on the client for zero-latency.
    res.json(resultJson);
  } catch (error) {
    console.error('Interview Turn Error:', error);
    res.status(500).json({ error: 'Failed to process interview turn' });
  }
});

/**
 * AI Interview: Final Feedback Summary
 */
app.post('/api/ai/interview/final-feedback', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionHistory, resumeText, jobDescription } = req.body;

  try {
    const result = await gemini.generateContent([
      `You are a Senior Career Coach. Analyze the full interview session history and provide a detailed report.
       Resume: ${resumeText}
       JD: ${jobDescription}
       History: ${JSON.stringify(sessionHistory)}
       
       Provide a structured report including:
       - Final Fit Score (0-100)
       - Proctoring Integrity Score (0-100)
       - Detailed breakdown of soft/hard skills shown.
       - Areas for improvement.`
    ]);

    const response = await result.response;
    res.json({ report: response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate final report' });
  }
});

// ──────────────────────────────────────────────
// AI Doubt Solver & Resume Services
// ──────────────────────────────────────────────

/**
 * AI Doubt Solver: Multimodal doubt analysis (Gemini 1.5)
 */
app.post('/api/ai/doubt-solver', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  const file = req.file;

  if (!query && !file) return res.status(400).json({ error: 'Provide at least a text query or a file' });

  try {
    const promptParts: any[] = [query || "Explain this in detail."];

    if (file) {
      promptParts.push({
        inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype }
      });
    }

    const result = await gemini.generateContent(promptParts);
    const response = await result.response;
    res.json({ answer: response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to solve doubt' });
  }
});

/**
 * Resume Import Service
 */
app.post('/api/ai/resume/import', authMiddleware, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    let text = '';
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    if (fileType === 'application/pdf') {
      const data = await pdf(fileBuffer);
      text = data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const data = await mammoth.extractRawText({ buffer: fileBuffer });
      text = data.value;
    }

    res.json({ text, fileName: req.file.originalname });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

// ──────────────────────────────────────────────
// Health & Utility
// ──────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Rakshak AI Backend is running smoothly',
    firebase: admin.apps.length > 0 ? 'connected' : 'not configured',
    services: {
      auth: !!admin.auth(),
      db: !!db,
      rtdb: !!rtdb,
      ai_groq: !!process.env.GROQ_API_KEY,
      ai_gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`);
});
