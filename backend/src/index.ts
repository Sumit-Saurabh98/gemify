import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { checkHealth as checkDatabaseHealth } from './config/database';
import { checkRedisHealth } from './config/redis';
import apiRoutes from './routes';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './middleware/errorHandler';
import {
  helmetConfig,
  requestSizeLimiter,
  sanitizeUserAgent,
  apiLimiter,
} from './middleware/security';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Security middleware
app.use(helmet(helmetConfig)); // Enhanced security headers
app.use(sanitizeUserAgent); // Block suspicious user agents

// CORS - must be before body parsing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing - must be before request size limiter
app.use(express.json({ limit: '1mb' })); // JSON with size limit
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request size limiter (for additional validation)
app.use(requestSizeLimiter);

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

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
