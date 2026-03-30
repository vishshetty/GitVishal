import express from 'express';
import cors from 'cors';
import { initDb } from './db/database';
import connectionsRouter from './routes/connections';
import issuesRouter from './routes/issues';
import testplanRouter from './routes/testplan';
import historyRouter from './routes/history';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/api/connections', connectionsRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/testplan', testplanRouter);
app.use('/api/history', historyRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Initialize DB
initDb().catch(err => console.error('Failed to initialize DB:', err));

// Start server only when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
    initDb().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Failed to initialize DB:', err);
    });
}

export default app;
