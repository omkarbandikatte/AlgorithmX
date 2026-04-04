import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import admin, { db, rtdb } from './config/firebase';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';
import groq from './config/groq';
import { GoogleGenerativeAI } from '@google/generative-ai';
import interviewRoutes from './routes/ai/interview.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Mount the new AI mock interview router
app.use('/api/ai/mock-interview', interviewRoutes);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

// ──────────────────────────────────────────────
// Resolved AI Roadmap (Exhaustive Precision Mode)
// ──────────────────────────────────────────────

app.post('/api/ai/roadmap', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { topic, language = "en-US" } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please provide a topic.' });

  try {
    console.log(`🗺️  AI Roadmap System Triggered: [${topic}] in ${language}`);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" } // FORCING JSON MODE
    });

    const prompt = `
      Generative Task: Create a hierarchical learning roadmap for: "${topic}".
      IMPORTANT: The entire response MUST be translated into the ${language} language code.
      Return a JSON object with:
      - nodes: array of {id: string, label: string (in ${language}), description: string (in ${language})}
      - edges: array of {from: string, to: string}
      Requirements: 6-10 nodes, strict dependency graph, beginner to advanced.
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().trim();

    console.log("🎨 RAW Response Captured.");

    const roadmap = JSON.parse(text);
    console.log("✅ Final Parsing Successful");
    res.json(roadmap);
  } catch (error: any) {
    console.error('❌ AI Roadmap Failure Deep-Dive:', error.message);
    res.status(500).json({
      error: 'AI Roadmap engine error.',
      details: error.message || 'Generation or parsing failed.'
    });
  }
});

app.post('/api/ai/roadmap/save', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { topic, nodes, edges } = req.body;
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const docRef = await db.collection('users').doc(req.user!.uid).collection('roadmaps').add({
      topic,
      nodes,
      edges,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: docRef.id, message: 'Saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save roadmap' });
  }
});

// ──────────────────────────────────────────────
// Multimodal Doubt Solver (Simplified Stability)
// ──────────────────────────────────────────────

app.post('/api/ai/doubt-solver', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  const { query, language = "en-US" } = req.body;
  const file = req.file;

  try {
    let finalQuery = query || "Explain this in detail.";
    let answer = "";
    
    // Inject Multilingual Prompt Prefix
    const langInstructions = `You MUST analyze and respond to this doubt ENTIRELY in ${language} language code. Do not use English unless the selected language is English. `;

    if (file && file.mimetype.startsWith('image/')) {
      const base64_img = file.buffer.toString('base64');
      const chat = await groq.chat.completions.create({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            // @ts-ignore
            content: [
              { type: "text", text: langInstructions + finalQuery },
              { type: "image_url", image_url: { url: `data:${file.mimetype};base64,${base64_img}` } },
            ],
          },
        ]
      });
      answer = chat.choices[0].message.content || "";
    } else if (file && file.mimetype.startsWith('audio/')) {
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
      fs.writeFileSync(tempFilePath, file.buffer);

      try {
        const transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: "whisper-large-v3",
          // Hardcode to selected language for whisper to avoid hallucinating
          language: language.split('-')[0],
        });
        finalQuery = `${langInstructions}\n\nTranscribed audio query: "${transcription.text}".\n\nAdditional context: ${finalQuery}`;
      } finally {
        const fs = require('fs');
        if(fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      }

      const chat = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: finalQuery }]
      });
      answer = chat.choices[0].message.content || "";
    } else {
      const chat = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: langInstructions + finalQuery }]
      });
      answer = chat.choices[0].message.content || "";
    }

    res.json({ answer });
  } catch (error: any) {
    console.error('❌ Doubt Solver Error:', error.message);
    res.status(500).json({ error: 'Doubt solver failed.' });
  }
});

// ──────────────────────────────────────────────
// Interview Turn logic
// ──────────────────────────────────────────────

app.post('/api/ai/interview/turn', authMiddleware, upload.fields([{ name: 'audio' }, { name: 'frame' }]), async (req: AuthenticatedRequest, res: Response) => {
  const { resumeText, jobDescription, history = "[]" } = req.body;
  const files = req.files as any;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const parts: any[] = [{ text: `AI Interviewer system prompt. Resume: ${resumeText}. History: ${history}. Analyze turn and return JSON: { "nextQuestion": "text", "proctoringScore": number, "proctoringFeedback": "string" }` }];

    if (files.audio?.[0]) parts.push({ inlineData: { data: files.audio[0].buffer.toString('base64'), mimeType: files.audio[0].mimetype } });
    if (files.frame?.[0]) parts.push({ inlineData: { data: files.frame[0].buffer.toString('base64'), mimeType: files.frame[0].mimetype } });

    const result = await model.generateContent(parts);
    const textResp = (await result.response).text().trim();
    if (!textResp) throw new Error("Empty gemini response on interview turn");

    // Safety check for json formatting if the SDK response is weird
    const jsonMatch = textResp.match(/\{[\s\S]*\}/);
    const parseableText = jsonMatch ? jsonMatch[0] : textResp;

    res.json(JSON.parse(parseableText));
  } catch (error: any) {
    console.error('❌ Interview Turn Error:', error.message);
    res.status(500).json({ error: 'Interview turn failed' });
  }
});

app.post('/api/ai/interview/final-feedback', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionHistory } = req.body;
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an AI Interview Coach. Provide a final evaluation report.
      Return strictly a JSON object:
      {
        "report": "Detailed 2-3 paragraph markdown report of their performance",
        "finalScore": 85
      }
      History: ${JSON.stringify(sessionHistory || [])}
    `;

    const result = await model.generateContent(prompt);
    const textResp = (await result.response).text().trim();

    const jsonMatch = textResp.match(/\{[\s\S]*\}/);
    const parseableText = jsonMatch ? jsonMatch[0] : textResp;

    const data = JSON.parse(parseableText);

    // Auto-Save Interview to DB
    if (db) {
      await db.collection('users').doc(req.user!.uid).collection('interviews').add({
        score: data.finalScore || 0,
        report: data.report || textResp,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Adaptive Intelligence: extract weak topics if score < 70
      if ((data.finalScore || 0) < 70 && data.report) {
        try {
          const extractionChat = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Extract weak topics from interview feedback. Return JSON: { "weakTopics": ["topic1","topic2"] }. Max 5.' },
              { role: 'user', content: `Score: ${data.finalScore}/100.\nReport:\n${data.report}` },
            ],
          });
          const extracted = JSON.parse(extractionChat.choices[0].message.content || '{}');
          const weakTopics: string[] = extracted.weakTopics || [];
          if (weakTopics.length > 0) {
            const topicList = weakTopics.slice(0, 3).join(', ');
            const insight = `You struggled with **${topicList}**. Want to generate a focused 3-day roadmap to close these gaps?`;
            await db.collection('users').doc(req.user!.uid).set(
              { weakTopics: admin.firestore.FieldValue.arrayUnion(...weakTopics), lastInsight: { text: insight, score: data.finalScore, topics: weakTopics, createdAt: new Date().toISOString() } },
              { merge: true }
            );
          }
        } catch (adaptiveErr: any) {
          console.warn('⚠️ Adaptive analysis skipped:', adaptiveErr.message);
        }
      }
    }

    res.json({ report: data.report || textResp, score: data.finalScore || 0 });
  } catch (error: any) {
    console.error('❌ Final Report Error:', error.message);
    res.status(500).json({ error: 'Report failed' });
  }
});

// ──────────────────────────────────────────────
// Resume Suite (LLaMA 3.3)
// ──────────────────────────────────────────────

app.post('/api/ai/resume/score', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are an expert HR resume reviewer. Analyze the resume and return ONLY valid JSON with this exact structure: { "totalScore": <number 0-100>, "breakdown": { "Contact Info": <score>, "Work Experience": <score>, "Education": <score>, "Skills": <score>, "Formatting": <score> }, "highlights": { "strengths": [<3-5 specific strength strings>], "weaknesses": [<3-5 specific improvement strings>] } }. No extra keys, no markdown.' }, { role: 'user', content: req.body.resumeText }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });
    const resultJson = JSON.parse(chat.choices[0].message.content || '{}');

    // Auto-Save Resume Score to DB
    if (db) {
      await db.collection('users').doc(req.user!.uid).collection('resumes').add({
        totalScore: resultJson.totalScore,
        breakdown: resultJson.breakdown,
        highlights: resultJson.highlights,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json(resultJson);
  } catch (error) {
    res.status(500).json({ error: 'Scoring failed.' });
  }
});

app.post('/api/ai/resume/enhance', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { resumeText, focusArea } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'No resume text provided.' });
  try {
    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert professional resume writer. Rewrite and enhance the provided resume to maximize impact for job applications. Focus on: ${focusArea || 'all sections'}. Use strong action verbs, quantify achievements where possible, improve clarity and formatting. Return ONLY the enhanced resume text — no commentary, no markdown code blocks, no extra explanation.`
        },
        { role: 'user', content: resumeText }
      ],
      model: 'llama-3.3-70b-versatile',
    });
    const enhancedText = chat.choices[0].message.content?.trim() || '';
    res.json({ enhancedText });
  } catch (error) {
    res.status(500).json({ error: 'Enhancement failed.' });
  }
});

app.post('/api/ai/resume/import', authMiddleware, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      text = (await pdf(req.file.buffer)).text;
    } else {
      text = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
    }
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Parse failed.' });
  }
});

// ──────────────────────────────────────────────
// AI Voice Command Interpreter
// ──────────────────────────────────────────────

app.post('/api/ai/voice-command', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, language = "en-US" } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    console.log(`🎙️  Groq Voice Intent Mapping: [${prompt}] in ${language}`);

    const systemPrompt = `
      You are the Rakshak AI Voice Concierge. 
      Convert user voice prompt into structured JSON.
      Paths: "/dashboard", "/resume", "/doubt-solver", "/interview", "/roadmap".
      
      Actions:
      - NAVIGATE: Go to a page.
      - EXECUTE: Navigate and perform task.
      
      Return JSON:
      {
        "action": "NAVIGATE" | "EXECUTE",
        "path": "string",
        "payload": { "topic": "string", "tab": "chat" | "talk" },
        "speech": "Short confirmation to say back entirely configured in the language: ${language}"
      }
      Example: "Go to talk mode" -> { "action": "NAVIGATE", "path": "/doubt-solver", "payload": { "tab": "talk" }, "speech": "Switching to talk mode." }
    `;

    const chat = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chat.choices[0].message.content || '{}');
    console.log("✅ Groq Intent Parsed Successfully");
    res.json(result);
  } catch (error: any) {
    console.error('❌ Groq Voice Error:', error.message);
    res.status(500).json({ error: 'Voice intent mapping failed' });
  }
});

// ──────────────────────────────────────────────
// Adaptive Intelligence Dashboard
// ──────────────────────────────────────────────

// GET /api/dashboard-data — Aggregated user profile for Neural Dashboard
app.get('/api/dashboard-data', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const uid = req.user!.uid;
    const [interviewsSnap, resumesSnap, profileSnap] = await Promise.all([
      db.collection('users').doc(uid).collection('interviews').orderBy('createdAt', 'desc').limit(10).get(),
      db.collection('users').doc(uid).collection('resumes').orderBy('createdAt', 'desc').limit(1).get(),
      db.collection('users').doc(uid).get(),
    ]);

    const interviews = interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    const latestResume = resumesSnap.docs[0]?.data() || null;
    const profile = profileSnap.data() || {};

    const interviewScores: number[] = interviews.map((i: any) => i.score || 0);
    const avgInterviewScore = interviewScores.length
      ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length)
      : 0;

    // Roadmap progress from profile doc
    const roadmapProgress = profile.roadmapProgress || { completed: 0, total: 0 };
    const roadmapPct = roadmapProgress.total > 0
      ? Math.round((roadmapProgress.completed / roadmapProgress.total) * 100)
      : 0;

    // Doubt solver usage (stored as count in profile)
    const doubtSolverScore = Math.min(100, (profile.doubtSolverCount || 0) * 5);

    const radarData = {
      resumeScore: latestResume?.totalScore || 0,
      interviewScore: avgInterviewScore,
      roadmapScore: roadmapPct,
      doubtSolverScore,
    };

    res.json({
      radarData,
      interviews: interviews.slice(0, 6),
      latestResume,
      roadmapProgress,
      weakTopics: profile.weakTopics || [],
      lastInsight: profile.lastInsight || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
});

// POST /api/analyze-interview — Parse interview report for weak topics & trigger AI insight
app.post('/api/analyze-interview', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  const { score, report } = req.body;
  if (score === undefined || !report) return res.status(400).json({ error: 'score and report are required' });

  try {
    const uid = req.user!.uid;

    // Extract weak topics via LLM
    const extractionChat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a career coach AI. Extract weak topics from interview feedback. Return JSON: { "weakTopics": ["topic1", "topic2"], "strongTopics": ["topic3"] }. Maximum 5 topics each.',
        },
        { role: 'user', content: `Interview score: ${score}/100.\n\nFeedback report:\n${report}` },
      ],
    });

    const extracted = JSON.parse(extractionChat.choices[0].message.content || '{}');
    const weakTopics: string[] = extracted.weakTopics || [];

    // Build AI insight if score < 70
    let insight: string | null = null;
    if (score < 70 && weakTopics.length > 0) {
      const topicList = weakTopics.slice(0, 3).join(', ');
      insight = `You struggled with **${topicList}**. Want to generate a focused 3-day roadmap to close these gaps?`;
    }

    // Persist to user profile
    await db.collection('users').doc(uid).set(
      {
        weakTopics: admin.firestore.FieldValue.arrayUnion(...weakTopics),
        ...(insight ? { lastInsight: { text: insight, score, topics: weakTopics, createdAt: new Date().toISOString() } } : {}),
      },
      { merge: true }
    );

    res.json({ weakTopics, insight });
  } catch (error: any) {
    console.error('❌ Analyze Interview Error:', error.message);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// POST /api/generate-micro-roadmap — AI-generated 3-5 step personal roadmap
app.post('/api/generate-micro-roadmap', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { topics } = req.body;
  if (!topics || !topics.length) return res.status(400).json({ error: 'topics array is required' });

  try {
    const topicList = Array.isArray(topics) ? topics.slice(0, 3).join(', ') : topics;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are a senior software engineering mentor.
      Create a focused 3-day micro learning roadmap for a developer who needs to improve: "${topicList}".
      
      Return strictly this JSON (no markdown wrapper):
      {
        "title": "3-Day [topic] Intensive",
        "steps": [
          {
            "day": 1,
            "title": "Step title",
            "tasks": ["Task 1", "Task 2", "Task 3"],
            "resource": "A specific free resource (YouTube channel, docs page, etc.)"
          }
        ]
      }
      
      Rules:
      - Exactly 3 days (steps)
      - 2-3 tasks per day
      - Practical, actionable tasks
      - Steps must build on each other
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const roadmap = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    res.json(roadmap);
  } catch (error: any) {
    console.error('❌ Micro Roadmap Error:', error.message);
    res.status(500).json({ error: 'Roadmap generation failed', details: error.message });
  }
});

// ──────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', firebase: admin.apps.length > 0 }));

// User History Fetcher
app.get('/api/user/history', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const uid = req.user!.uid;
    const roadmapsSnap = await db.collection('users').doc(uid).collection('roadmaps').orderBy('createdAt', 'desc').get();
    const interviewsSnap = await db.collection('users').doc(uid).collection('interviews').orderBy('createdAt', 'desc').get();
    const resumesSnap = await db.collection('users').doc(uid).collection('resumes').orderBy('createdAt', 'desc').get();

    res.json({
      roadmaps: roadmapsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      interviews: interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      resumes: resumesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));
