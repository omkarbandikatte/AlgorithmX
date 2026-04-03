import { Request, Response } from 'express';
import * as service from '../../services/ai/interview.service';
import fs from 'fs';

export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { role, techStack, experience } = req.body;
    const data = await service.generateQuestionsService(role, techStack, experience);
    res.json(data);
  } catch (err: any) {
    console.error('generateQuestions error:', err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
       return res.status(400).json({ error: "No audio file provided" });
    }
    
    // Add extension so Whisper API can infer correct MIME type
    const originalPath = req.file.path;
    const pathWithExt = originalPath + ".webm";
    fs.renameSync(originalPath, pathWithExt);
    
    // Leverage Groq Whisper via service
    const transcript = await service.transcribeAudioService(pathWithExt);
    
    // Cleanup temp file uploaded by multer
    if (fs.existsSync(pathWithExt)) {
       fs.unlinkSync(pathWithExt);
    }

    res.json({ text: transcript });
  } catch (err: any) {
    console.error('transcribeAudio error:', err);
    if (req.file) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(req.file.path + ".webm")) fs.unlinkSync(req.file.path + ".webm");
    }
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
};

export const evaluateAnswer = async (req: Request, res: Response) => {
  try {
    const { question, userAnswer } = req.body;
    const data = await service.evaluateAnswerService(question, userAnswer);
    res.json(data);
  } catch (err: any) {
    console.error('evaluateAnswer error:', err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
};