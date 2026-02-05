import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { checkHealth as checkDatabaseHealth } from './config/database';
import { checkRedisHealth } from './config/redis';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const [dbHealthy, redisHealthy] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth()
  ]);
  
  const overallHealthy = dbHealthy && redisHealthy;
  
  res.status(overallHealthy ? 200 : 503).json({
    status: overallHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      redis: redisHealthy ? 'connected' : 'disconnected'
    }
  });
});

// Welcome route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'GamerHub AI Live Chat Agent API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      chat: {
        createConversation: 'POST /api/chat/conversations',
        getConversation: 'GET /api/chat/conversations/:conversationId',
        getMessages: 'GET /api/chat/conversations/:conversationId/messages',
        sendMessage: 'POST /api/chat/message',
        moderate: 'POST /api/chat/moderate',
        suggestions: 'GET /api/chat/suggestions',
      }
    }
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GamerHub Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
