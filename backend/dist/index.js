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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const firebase_1 = __importStar(require("./config/firebase"));
const auth_1 = require("./middleware/auth");
const groq_1 = __importDefault(require("./config/groq"));
const generative_ai_1 = require("@google/generative-ai");
const interview_routes_1 = __importDefault(require("./routes/ai/interview.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ limit: '20mb', extended: true }));
// Mount the new AI mock interview router
app.use('/api/ai/mock-interview', interview_routes_1.default);
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});
// ──────────────────────────────────────────────
// Resolved AI Roadmap (Exhaustive Precision Mode)
// ──────────────────────────────────────────────
app.post('/api/ai/roadmap', auth_1.authMiddleware, async (req, res) => {
    const { topic } = req.body;
    if (!topic)
        return res.status(400).json({ error: 'Please provide a topic.' });
    try {
        console.log(`🗺️  AI Roadmap System Triggered: [${topic}]`);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" } // FORCING JSON MODE
        });
        const prompt = `
      Generative Task: Create a hierarchical learning roadmap for: "${topic}".
      Return a JSON object with:
      - nodes: array of {id: string, label: string, description: string}
      - edges: array of {from: string, to: string}
      Requirements: 6-10 nodes, strict dependency graph, beginner to advanced.
    `;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        console.log("🎨 RAW Response Captured.");
        const roadmap = JSON.parse(text);
        console.log("✅ Final Parsing Successful");
        res.json(roadmap);
    }
    catch (error) {
        console.error('❌ AI Roadmap Failure Deep-Dive:', error.message);
        res.status(500).json({
            error: 'AI Roadmap engine error.',
            details: error.message || 'Generation or parsing failed.'
        });
    }
});
app.post('/api/ai/roadmap/save', auth_1.authMiddleware, async (req, res) => {
    const { topic, nodes, edges } = req.body;
    if (!firebase_1.db)
        return res.status(500).json({ error: 'DB not initialized' });
    try {
        const docRef = await firebase_1.db.collection('users').doc(req.user.uid).collection('roadmaps').add({
            topic,
            nodes,
            edges,
            createdAt: firebase_1.default.firestore.FieldValue.serverTimestamp()
        });
        res.json({ id: docRef.id, message: 'Saved successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save roadmap' });
    }
});
// ──────────────────────────────────────────────
// Multimodal Doubt Solver (Simplified Stability)
// ──────────────────────────────────────────────
app.post('/api/ai/doubt-solver', auth_1.authMiddleware, upload.single('file'), async (req, res) => {
    const { query } = req.body;
    const file = req.file;
    try {
        let finalQuery = query || "Explain this in detail.";
        let answer = "";
        if (file && file.mimetype.startsWith('image/')) {
            const base64_img = file.buffer.toString('base64');
            const chat = await groq_1.default.chat.completions.create({
                model: "llama-3.2-11b-vision-preview",
                messages: [
                    {
                        role: "user",
                        // @ts-ignore
                        content: [
                            { type: "text", text: finalQuery },
                            { type: "image_url", image_url: { url: `data:${file.mimetype};base64,${base64_img}` } },
                        ],
                    },
                ]
            });
            answer = chat.choices[0].message.content || "";
        }
        else if (file && file.mimetype.startsWith('audio/')) {
            const fs = require('fs');
            const os = require('os');
            const path = require('path');
            const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
            fs.writeFileSync(tempFilePath, file.buffer);
            try {
                const transcription = await groq_1.default.audio.transcriptions.create({
                    file: fs.createReadStream(tempFilePath),
                    model: "whisper-large-v3",
                });
                finalQuery = `Transcribed audio query: "${transcription.text}".\n\nAdditional context: ${finalQuery}`;
            }
            finally {
                fs.unlinkSync(tempFilePath);
            }
            const chat = await groq_1.default.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: finalQuery }]
            });
            answer = chat.choices[0].message.content || "";
        }
        else {
            const chat = await groq_1.default.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: finalQuery }]
            });
            answer = chat.choices[0].message.content || "";
        }
        res.json({ answer });
    }
    catch (error) {
        console.error('❌ Doubt Solver Error:', error.message);
        res.status(500).json({ error: 'Doubt solver failed.' });
    }
});
// ──────────────────────────────────────────────
// Interview Turn logic
// ──────────────────────────────────────────────
app.post('/api/ai/interview/turn', auth_1.authMiddleware, upload.fields([{ name: 'audio' }, { name: 'frame' }]), async (req, res) => {
    const { resumeText, jobDescription, history = "[]" } = req.body;
    const files = req.files;
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        const parts = [{ text: `AI Interviewer system prompt. Resume: ${resumeText}. History: ${history}. Analyze turn and return JSON: { "nextQuestion": "text", "proctoringScore": number, "proctoringFeedback": "string" }` }];
        if (files.audio?.[0])
            parts.push({ inlineData: { data: files.audio[0].buffer.toString('base64'), mimeType: files.audio[0].mimetype } });
        if (files.frame?.[0])
            parts.push({ inlineData: { data: files.frame[0].buffer.toString('base64'), mimeType: files.frame[0].mimetype } });
        const result = await model.generateContent(parts);
        const textResp = (await result.response).text().trim();
        if (!textResp)
            throw new Error("Empty gemini response on interview turn");
        // Safety check for json formatting if the SDK response is weird
        const jsonMatch = textResp.match(/\{[\s\S]*\}/);
        const parseableText = jsonMatch ? jsonMatch[0] : textResp;
        res.json(JSON.parse(parseableText));
    }
    catch (error) {
        console.error('❌ Interview Turn Error:', error.message);
        res.status(500).json({ error: 'Interview turn failed' });
    }
});
app.post('/api/ai/interview/final-feedback', auth_1.authMiddleware, async (req, res) => {
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
        if (firebase_1.db) {
            await firebase_1.db.collection('users').doc(req.user.uid).collection('interviews').add({
                score: data.finalScore || 0,
                report: data.report || textResp,
                createdAt: firebase_1.default.firestore.FieldValue.serverTimestamp()
            });
            // Adaptive Intelligence: extract weak topics if score < 70
            if ((data.finalScore || 0) < 70 && data.report) {
                try {
                    const extractionChat = await groq_1.default.chat.completions.create({
                        model: 'llama-3.3-70b-versatile',
                        response_format: { type: 'json_object' },
                        messages: [
                            { role: 'system', content: 'Extract weak topics from interview feedback. Return JSON: { "weakTopics": ["topic1","topic2"] }. Max 5.' },
                            { role: 'user', content: `Score: ${data.finalScore}/100.\nReport:\n${data.report}` },
                        ],
                    });
                    const extracted = JSON.parse(extractionChat.choices[0].message.content || '{}');
                    const weakTopics = extracted.weakTopics || [];
                    if (weakTopics.length > 0) {
                        const topicList = weakTopics.slice(0, 3).join(', ');
                        const insight = `You struggled with **${topicList}**. Want to generate a focused 3-day roadmap to close these gaps?`;
                        await firebase_1.db.collection('users').doc(req.user.uid).set({ weakTopics: firebase_1.default.firestore.FieldValue.arrayUnion(...weakTopics), lastInsight: { text: insight, score: data.finalScore, topics: weakTopics, createdAt: new Date().toISOString() } }, { merge: true });
                    }
                }
                catch (adaptiveErr) {
                    console.warn('⚠️ Adaptive analysis skipped:', adaptiveErr.message);
                }
            }
        }
        res.json({ report: data.report || textResp, score: data.finalScore || 0 });
    }
    catch (error) {
        console.error('❌ Final Report Error:', error.message);
        res.status(500).json({ error: 'Report failed' });
    }
});
// ──────────────────────────────────────────────
// Resume Suite (LLaMA 3.3)
// ──────────────────────────────────────────────
app.post('/api/ai/resume/score', auth_1.authMiddleware, async (req, res) => {
    try {
        const chat = await groq_1.default.chat.completions.create({
            messages: [{ role: 'system', content: 'HR Expert. JSON Score: totalScore, breakdown, highlights.' }, { role: 'user', content: req.body.resumeText }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });
        const resultJson = JSON.parse(chat.choices[0].message.content || '{}');
        // Auto-Save Resume Score to DB
        if (firebase_1.db) {
            await firebase_1.db.collection('users').doc(req.user.uid).collection('resumes').add({
                totalScore: resultJson.totalScore,
                breakdown: resultJson.breakdown,
                highlights: resultJson.highlights,
                createdAt: firebase_1.default.firestore.FieldValue.serverTimestamp()
            });
        }
        res.json(resultJson);
    }
    catch (error) {
        res.status(500).json({ error: 'Scoring failed.' });
    }
});
app.post('/api/ai/resume/import', auth_1.authMiddleware, upload.single('resume'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file' });
    try {
        let text = '';
        if (req.file.mimetype === 'application/pdf') {
            text = (await (0, pdf_parse_1.default)(req.file.buffer)).text;
        }
        else {
            text = (await mammoth_1.default.extractRawText({ buffer: req.file.buffer })).value;
        }
        res.json({ text });
    }
    catch (error) {
        res.status(500).json({ error: 'Parse failed.' });
    }
});
// ──────────────────────────────────────────────
// AI Voice Command Interpreter
// ──────────────────────────────────────────────
app.post('/api/ai/voice-command', auth_1.authMiddleware, async (req, res) => {
    const { prompt } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "No prompt provided" });
    try {
        console.log(`🎙️  Groq Voice Intent Mapping: [${prompt}]`);
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
        "speech": "Short confirmation to say back"
      }
      Example: "Go to talk mode" -> { "action": "NAVIGATE", "path": "/doubt-solver", "payload": { "tab": "talk" }, "speech": "Switching to talk mode." }
    `;
        const chat = await groq_1.default.chat.completions.create({
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
    }
    catch (error) {
        console.error('❌ Groq Voice Error:', error.message);
        res.status(500).json({ error: 'Voice intent mapping failed' });
    }
});
// ──────────────────────────────────────────────
// Adaptive Intelligence Dashboard
// ──────────────────────────────────────────────
// GET /api/dashboard-data — Aggregated user profile for Neural Dashboard
app.get('/api/dashboard-data', auth_1.authMiddleware, async (req, res) => {
    if (!firebase_1.db)
        return res.status(500).json({ error: 'DB not initialized' });
    try {
        const uid = req.user.uid;
        const [interviewsSnap, resumesSnap, profileSnap] = await Promise.all([
            firebase_1.db.collection('users').doc(uid).collection('interviews').orderBy('createdAt', 'desc').limit(10).get(),
            firebase_1.db.collection('users').doc(uid).collection('resumes').orderBy('createdAt', 'desc').limit(1).get(),
            firebase_1.db.collection('users').doc(uid).get(),
        ]);
        const interviews = interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const latestResume = resumesSnap.docs[0]?.data() || null;
        const profile = profileSnap.data() || {};
        const interviewScores = interviews.map((i) => i.score || 0);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
    }
});
// POST /api/analyze-interview — Parse interview report for weak topics & trigger AI insight
app.post('/api/analyze-interview', auth_1.authMiddleware, async (req, res) => {
    if (!firebase_1.db)
        return res.status(500).json({ error: 'DB not initialized' });
    const { score, report } = req.body;
    if (score === undefined || !report)
        return res.status(400).json({ error: 'score and report are required' });
    try {
        const uid = req.user.uid;
        // Extract weak topics via LLM
        const extractionChat = await groq_1.default.chat.completions.create({
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
        const weakTopics = extracted.weakTopics || [];
        // Build AI insight if score < 70
        let insight = null;
        if (score < 70 && weakTopics.length > 0) {
            const topicList = weakTopics.slice(0, 3).join(', ');
            insight = `You struggled with **${topicList}**. Want to generate a focused 3-day roadmap to close these gaps?`;
        }
        // Persist to user profile
        await firebase_1.db.collection('users').doc(uid).set({
            weakTopics: firebase_1.default.firestore.FieldValue.arrayUnion(...weakTopics),
            ...(insight ? { lastInsight: { text: insight, score, topics: weakTopics, createdAt: new Date().toISOString() } } : {}),
        }, { merge: true });
        res.json({ weakTopics, insight });
    }
    catch (error) {
        console.error('❌ Analyze Interview Error:', error.message);
        res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
});
// POST /api/generate-micro-roadmap — AI-generated 3-5 step personal roadmap
app.post('/api/generate-micro-roadmap', auth_1.authMiddleware, async (req, res) => {
    const { topics } = req.body;
    if (!topics || !topics.length)
        return res.status(400).json({ error: 'topics array is required' });
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
    }
    catch (error) {
        console.error('❌ Micro Roadmap Error:', error.message);
        res.status(500).json({ error: 'Roadmap generation failed', details: error.message });
    }
});
// ──────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', firebase: firebase_1.default.apps.length > 0 }));
// User History Fetcher
app.get('/api/user/history', auth_1.authMiddleware, async (req, res) => {
    if (!firebase_1.db)
        return res.status(500).json({ error: 'DB not initialized' });
    try {
        const uid = req.user.uid;
        const roadmapsSnap = await firebase_1.db.collection('users').doc(uid).collection('roadmaps').orderBy('createdAt', 'desc').get();
        const interviewsSnap = await firebase_1.db.collection('users').doc(uid).collection('interviews').orderBy('createdAt', 'desc').get();
        const resumesSnap = await firebase_1.db.collection('users').doc(uid).collection('resumes').orderBy('createdAt', 'desc').get();
        res.json({
            roadmaps: roadmapsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            interviews: interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            resumes: resumesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});
app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));
