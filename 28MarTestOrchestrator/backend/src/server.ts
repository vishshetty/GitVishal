import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import apiRouter from './routes/api';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test Orchestrator Backend is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
