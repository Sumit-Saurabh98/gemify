import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import suggestionsRoute from './routes/suggestions';
import conversationsRoute from './routes/conversations';
import messagesRoute from './routes/messages';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  res.send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// Routes
app.use('/api/v1/suggestions', suggestionsRoute);
app.use('/api/v1/conversations', conversationsRoute);
app.use('/api/v1/messages', messagesRoute);



// Start server
app.listen(PORT, () => {
  console.log(`🚀 GamerHub Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
