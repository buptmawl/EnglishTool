import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/video.js';
import learningRoutes from './routes/learning.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Ensure port matches Vite proxy/fetch calls

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/video', videoRoutes);
app.use('/api/learning', learningRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route to prevent "API not found" HTML responses that break JSON parsing
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', details: `Path ${req.originalUrl} does not exist` });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
