"use strict";
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
const firebase_1 = __importDefault(require("./config/firebase"));
const auth_1 = require("./middleware/auth");
const groq_1 = __importDefault(require("./config/groq"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ limit: '20mb', extended: true }));
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
// ──────────────────────────────────────────────
// Multimodal Doubt Solver (Simplified Stability)
// ──────────────────────────────────────────────
app.post('/api/ai/doubt-solver', auth_1.authMiddleware, upload.single('file'), async (req, res) => {
    const { query } = req.body;
    const file = req.file;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const parts = [{ text: query || "Explain this in detail." }];
        if (file) {
            parts.push({ inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype } });
        }
        const result = await model.generateContent(parts);
        res.json({ answer: (await result.response).text() });
    }
    catch (error) {
        console.error('❌ Doubt Solver Error:', error.message);
        res.status(500).json({ error: 'Doubt solver failed.' });
    }
});
const interview_routes_1 = __importDefault(require("./routes/ai/interview.routes"));
// ──────────────────────────────────────────────
// Interview Suite (Groq Modular)
// ──────────────────────────────────────────────
app.use('/api/ai/interview', interview_routes_1.default);
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
        res.json(JSON.parse(chat.choices[0].message.content || '{}'));
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
// Health
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', firebase: firebase_1.default.apps.length > 0 }));
app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));
