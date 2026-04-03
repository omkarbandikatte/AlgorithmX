import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running smoothly' });
});

app.get('/api/data', (req: Request, res: Response) => {
  const data = [
    { id: 1, name: 'Bubble Sort', performance: 'O(n^2)' },
    { id: 2, name: 'Quick Sort', performance: 'O(n log n)' },
    { id: 3, name: 'Merge Sort', performance: 'O(n log n)' },
    { id: 4, name: 'Insertion Sort', performance: 'O(n^2)' },
  ];
  res.json(data);
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
