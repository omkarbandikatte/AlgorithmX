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
    console.log(`🗺️ AI Roadmap System Triggered: [${topic}] in ${language} (Groq Optimized)`);
    
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert curriculum designer AI. Create a high-quality hierarchical learning roadmap for: "${topic}".
            Return ONLY a JSON object with:
            - nodes: array of {id: string, label: string, description: string}
            - edges: array of {from: string, to: string}
            Requirements: 6-10 nodes, strict dependency graph from beginner to advanced.
            IMPORTANT: Transcribe every label and description EXACTLY into the ${language} language code.`
        },
        { role: "user", content: `Generate a detailed roadmap for ${topic}` }
      ],
      response_format: { type: "json_object" }
    });

    const roadmap = JSON.parse(chat.choices[0].message.content || '{}');
    console.log("✅ Final Groq Roadmap Parsing Successful");
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

// POST /api/save-doubt-session — Persist doubt session in Firestore
app.post('/api/save-doubt-session', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  const { sessionId, title, messages } = req.body;
  if (!sessionId || !messages) return res.status(400).json({ error: 'Session ID and messages required' });

  try {
    const uid = req.user!.uid;
    await db.collection('users').doc(uid).collection('doubts').doc(sessionId).set({
      title: title || 'New Doubt',
      messages,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Increment doubt count in profile for dashboard
    await db.collection('users').doc(uid).set({
        doubtSolverCount: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save doubt session' });
  }
});

// GET /api/user/doubts — Retrieve all doubt sessions
app.get('/api/user/doubts', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const uid = req.user!.uid;
    const snap = await db.collection('users').doc(uid).collection('doubts').orderBy('updatedAt', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doubts' });
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
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
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
// Resume Skill Extraction (LLM-powered)
// ──────────────────────────────────────────────

const SKILL_ALIASES: Record<string, string> = {
  'js': 'javascript', 'ts': 'typescript', 'py': 'python', 'rb': 'ruby',
  'c#': 'csharp', 'c++': 'cpp', 'golang': 'go', 'node': 'nodejs',
  'node.js': 'nodejs', 'react.js': 'react', 'reactjs': 'react',
  'vue.js': 'vue', 'vuejs': 'vue', 'angular.js': 'angular', 'angularjs': 'angular',
  'next.js': 'nextjs', 'express.js': 'expressjs', 'expressjs': 'expressjs',
  'mongo': 'mongodb', 'postgres': 'postgresql', 'psql': 'postgresql',
  'aws': 'amazon web services', 'gcp': 'google cloud platform',
  'k8s': 'kubernetes', 'tf': 'terraform', 'ml': 'machine learning',
  'ai': 'artificial intelligence', 'dl': 'deep learning',
  'css3': 'css', 'html5': 'html', 'sass': 'scss',
  'rest': 'rest api', 'restful': 'rest api',
  'graphql': 'graphql', 'd3': 'd3.js', 'tailwind': 'tailwindcss',
};

function normalizeSkill(skill: string): string {
  const trimmed = skill.trim().toLowerCase();
  return SKILL_ALIASES[trimmed] || trimmed;
}

function deduplicateSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  return skills
    .map(normalizeSkill)
    .filter(s => s.length > 0)
    .filter(s => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
}

app.post('/api/ai/resume/extract-skills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { resumeText } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'No resume text provided.' });

  try {
    console.log('🧠 Extracting skills from resume...');

    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert HR resume parser. Analyze the resume text and extract structured data.
Return ONLY valid JSON with this exact structure:
{
  "name": "Full name from resume",
  "email": "Email from resume or empty string",
  "skills": ["skill1", "skill2", ...],
  "experience": [{"title": "Job Title", "company": "Company", "duration": "Duration", "description": "Brief description"}],
  "education": [{"degree": "Degree", "institution": "School", "year": "Year"}],
  "projects": [{"name": "Project Name", "description": "Brief description", "technologies": ["tech1"]}]
}
Be thorough in extracting ALL skills mentioned — programming languages, frameworks, tools, soft skills, methodologies, databases, cloud platforms, etc.`
        },
        { role: 'user', content: resumeText }
      ]
    });

    const extracted = JSON.parse(chat.choices[0].message.content || '{}');
    
    // Normalize and deduplicate skills
    const normalizedSkills = deduplicateSkills(extracted.skills || []);

    const result = {
      name: extracted.name || '',
      email: extracted.email || '',
      skills: normalizedSkills,
      experience: extracted.experience || [],
      education: extracted.education || [],
      projects: extracted.projects || [],
    };

    // Store in Firestore
    if (db) {
      await db.collection('users').doc(req.user!.uid).set(
        {
          extractedProfile: result,
          skills: normalizedSkills,
          profileUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    }

    console.log(`✅ Extracted ${normalizedSkills.length} skills`);
    res.json(result);
  } catch (error: any) {
    console.error('❌ Skill Extraction Error:', error.message);
    res.status(500).json({ error: 'Skill extraction failed.', details: error.message });
  }
});

// Update skills manually (editable skills)
app.post('/api/ai/resume/update-skills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { skills } = req.body;
  if (!skills || !Array.isArray(skills)) return res.status(400).json({ error: 'skills array is required' });

  try {
    const normalizedSkills = deduplicateSkills(skills);
    if (db) {
      await db.collection('users').doc(req.user!.uid).set(
        { skills: normalizedSkills, profileUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    }
    res.json({ skills: normalizedSkills, message: 'Skills updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update skills', details: error.message });
  }
});

// Get user skills
app.get('/api/ai/resume/skills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const doc = await db.collection('users').doc(req.user!.uid).get();
    const data = doc.data() || {};
    res.json({ skills: data.skills || [], extractedProfile: data.extractedProfile || null });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch skills', details: error.message });
  }
});

// ──────────────────────────────────────────────
// Hidden Job Market (Arbeitnow API + Smart Matching)
// ──────────────────────────────────────────────

interface CachedJobs {
  data: any[];
  fetchedAt: number;
}

let jobCache: CachedJobs | null = null;
const JOB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchArbeitnowJobs(): Promise<any[]> {
  if (jobCache && Date.now() - jobCache.fetchedAt < JOB_CACHE_TTL) {
    console.log('📦 Returning cached jobs');
    return jobCache.data;
  }

  try {
    console.log('🔄 Fetching fresh jobs from Arbeitnow...');
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const result = await response.json();
    const jobs = result.data || [];
    
    jobCache = { data: jobs, fetchedAt: Date.now() };
    console.log(`✅ Cached ${jobs.length} jobs`);
    return jobs;
  } catch (error: any) {
    console.error('❌ Arbeitnow fetch error:', error.message);
    // Return stale cache if available
    if (jobCache) return jobCache.data;
    return [];
  }
}

function computeJobMatchScore(userSkills: string[], jobTags: string[], jobTitle: string, jobDescription: string): {
  score: number;
  matchedSkills: string[];
  totalPossible: number;
} {
  const matchedSkills: string[] = [];
  let points = 0;
  const maxPoints = userSkills.length * 2;

  const jobTagsLower = (jobTags || []).map((t: string) => t.toLowerCase());
  const titleLower = (jobTitle || '').toLowerCase();
  const descLower = (jobDescription || '').toLowerCase();

  for (const skill of userSkills) {
    const skillLower = skill.toLowerCase();
    
    // Exact tag match = +2
    if (jobTagsLower.includes(skillLower)) {
      points += 2;
      matchedSkills.push(skill);
      continue;
    }

    // Check if skill appears in tags with partial match
    const partialTagMatch = jobTagsLower.some(t => t.includes(skillLower) || skillLower.includes(t));
    if (partialTagMatch) {
      points += 1.5;
      matchedSkills.push(skill);
      continue;
    }

    // Check title or description for partial match = +1
    if (titleLower.includes(skillLower) || descLower.includes(skillLower)) {
      points += 1;
      matchedSkills.push(skill);
    }
  }

  return {
    score: maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0,
    matchedSkills,
    totalPossible: maxPoints,
  };
}

app.get('/api/jobs/hidden-market', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user's skills from Firestore
    let userSkills: string[] = [];
    if (db) {
      const userDoc = await db.collection('users').doc(req.user!.uid).get();
      const userData = userDoc.data() || {};
      userSkills = userData.skills || [];
    }

    // Fetch jobs (with cache)
    const allJobs = await fetchArbeitnowJobs();

    // Score and rank every job
    const scoredJobs = allJobs.map((job: any) => {
      const { score, matchedSkills } = computeJobMatchScore(
        userSkills,
        job.tags || [],
        job.title || '',
        job.description || ''
      );

      // Missing skills = job tags not in user skills
      const userSkillsLower = userSkills.map(s => s.toLowerCase());
      const missingSkills = (job.tags || []).filter((t: string) =>
        !userSkillsLower.some(us => us === t.toLowerCase() || t.toLowerCase().includes(us) || us.includes(t.toLowerCase()))
      );

      return {
        title: job.title,
        company_name: job.company_name,
        tags: job.tags || [],
        location: job.location,
        url: job.url,
        remote: job.remote,
        description: job.description,
        created_at: job.created_at,
        matchScore: score,
        matchedSkills,
        missingSkills: missingSkills.slice(0, 5),
      };
    });

    // Sort by match score descending
    scoredJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.json({
      jobs: scoredJobs,
      totalJobs: scoredJobs.length,
      userSkills,
      cachedAt: jobCache?.fetchedAt || null,
    });
  } catch (error: any) {
    console.error('❌ Hidden Job Market Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch job market data', details: error.message });
  }
});

// AI deep-match analysis for a specific job
app.post('/api/jobs/ai-match', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { jobTitle, jobTags, jobDescription, userSkills } = req.body;
  if (!jobTitle || !userSkills) return res.status(400).json({ error: 'jobTitle and userSkills required' });

  try {
    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a career advisor AI. Compare the user's skills with a job listing and return a detailed analysis.
Return JSON:
{
  "matchScore": <0-100>,
  "reasoning": "2-3 sentences explaining the match",
  "whyFits": "2-3 sentences on why this job fits the user",
  "skillsToLearn": ["skill1", "skill2"],
  "aiCoverMessage": "A short, professional cover message (3-4 sentences) the user can send when applying"
}`
        },
        {
          role: 'user',
          content: `User Skills: ${JSON.stringify(userSkills)}\n\nJob Title: ${jobTitle}\nJob Tags: ${JSON.stringify(jobTags || [])}\nJob Description: ${(jobDescription || '').substring(0, 2000)}`
        }
      ]
    });

    const result = JSON.parse(chat.choices[0].message.content || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('❌ AI Match Error:', error.message);
    res.status(500).json({ error: 'AI match analysis failed', details: error.message });
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
    const doubtsSnap = await db.collection('users').doc(uid).collection('doubts').orderBy('updatedAt', 'desc').get();

    res.json({
      roadmaps: roadmapsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      interviews: interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      resumes: resumesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      doubts: doubtsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));
