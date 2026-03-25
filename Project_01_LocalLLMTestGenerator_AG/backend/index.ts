import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import llmRouter from './llmRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/llm', llmRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running correctly' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
