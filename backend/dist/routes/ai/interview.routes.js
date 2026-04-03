"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const interview_controller_1 = require("../../controllers/ai/interview.controller");
const auth_1 = require("../../middleware/auth");
const os_1 = __importDefault(require("os"));
const router = express_1.default.Router();
// Multer setup required for audio files from frontend so that it's written to disk for Whisper API
const upload = (0, multer_1.default)({ dest: os_1.default.tmpdir() + "/uploads/" });
// Map auth middleware
router.use(auth_1.authMiddleware);
router.post("/generate", interview_controller_1.generateQuestions);
router.post("/transcribe", upload.single("audio"), interview_controller_1.transcribeAudio);
router.post("/evaluate", interview_controller_1.evaluateAnswer);
exports.default = router;
