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
exports.evaluateAnswer = exports.transcribeAudio = exports.generateQuestions = void 0;
const service = __importStar(require("../../services/ai/interview.service"));
const fs_1 = __importDefault(require("fs"));
const generateQuestions = async (req, res) => {
    try {
        const { role, techStack, experience, language } = req.body;
        const data = await service.generateQuestionsService(role, techStack, experience, language);
        res.json(data);
    }
    catch (err) {
        console.error('generateQuestions error:', err);
        res.status(500).json({ error: "Failed to generate questions" });
    }
};
exports.generateQuestions = generateQuestions;
const transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }
        // Add extension so Whisper API can infer correct MIME type
        const originalPath = req.file.path;
        const pathWithExt = originalPath + ".webm";
        fs_1.default.renameSync(originalPath, pathWithExt);
        // Leverage Groq Whisper via service
        const transcript = await service.transcribeAudioService(pathWithExt);
        // Cleanup temp file uploaded by multer
        if (fs_1.default.existsSync(pathWithExt)) {
            fs_1.default.unlinkSync(pathWithExt);
        }
        res.json({ text: transcript });
    }
    catch (err) {
        console.error('transcribeAudio error:', err);
        if (req.file) {
            if (fs_1.default.existsSync(req.file.path))
                fs_1.default.unlinkSync(req.file.path);
            if (fs_1.default.existsSync(req.file.path + ".webm"))
                fs_1.default.unlinkSync(req.file.path + ".webm");
        }
        res.status(500).json({ error: "Failed to transcribe audio" });
    }
};
exports.transcribeAudio = transcribeAudio;
const evaluateAnswer = async (req, res) => {
    try {
        const { question, userAnswer, language } = req.body;
        const data = await service.evaluateAnswerService(question, userAnswer, language);
        res.json(data);
    }
    catch (err) {
        console.error('evaluateAnswer error:', err);
        res.status(500).json({ error: "Failed to evaluate answer" });
    }
};
exports.evaluateAnswer = evaluateAnswer;
