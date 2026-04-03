import express from "express";
import multer from "multer";
import { generateQuestions, evaluateAnswer, transcribeAudio } from "../../controllers/ai/interview.controller";
import { authMiddleware } from "../../middleware/auth";
import os from "os";

const router = express.Router();

// Multer setup required for audio files from frontend so that it's written to disk for Whisper API
const upload = multer({ dest: os.tmpdir() });

// Map auth middleware
router.use(authMiddleware as express.RequestHandler);

router.post("/generate", generateQuestions as express.RequestHandler);
router.post("/transcribe", upload.single("audio"), transcribeAudio as express.RequestHandler);
router.post("/evaluate", evaluateAnswer as express.RequestHandler);

export default router;