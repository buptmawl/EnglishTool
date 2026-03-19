/**
 * local server entry file, for local development
 */
import app from './app.js';

/**
 * start server with port
 */
// Front-end explicitly fetches from http://localhost:3001
const PORT = process.env.PORT || 3001;

// Catch-all route to properly return JSON instead of "API not found" HTML
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', details: `Path ${req.originalUrl} does not exist` });
});

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;