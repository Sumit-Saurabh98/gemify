import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    resetIn: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for chat endpoints
 * 20 requests per 1 minute per IP
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: 'Too many chat requests. Please slow down.',
    resetIn: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Very strict rate limiter for AI endpoints
 * 10 requests per 1 minute per IP
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'AI request limit exceeded. Please wait before making more requests.',
    resetIn: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for conversation creation
 * 5 new conversations per 15 minutes per IP
 */
export const createConversationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many conversations created. Please try again later.',
    resetIn: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Request size limiter middleware
 */
export const requestSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = req.headers['content-length'];
  
  if (contentLength) {
    const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
    const maxSizeMB = 1; // 1MB max
    
    if (sizeMB > maxSizeMB) {
      res.status(413).json({
        success: false,
        error: 'Request Entity Too Large',
        message: `Request body exceeds maximum size of ${maxSizeMB}MB`,
      });
      return;
    }
  }
  
  next();
};

/**
 * IP whitelist/blacklist middleware (optional)
 */
export const ipFilter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const blacklist = process.env.IP_BLACKLIST?.split(',') || [];
  const clientIp = req.ip || req.socket.remoteAddress || '';
  
  if (blacklist.includes(clientIp)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Access denied',
    });
    return;
  }
  
  next();
};

/**
 * Security headers configuration for helmet
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny' as const,
  },
};

/**
 * Sanitize user agent to prevent abuse
 */
export const sanitizeUserAgent = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Block known bot patterns (optional - customize as needed)
  const blockedPatterns = [
    /curl/i,
    /wget/i,
    /scrapy/i,
  ];
  
  // Only block in production
  if (process.env.NODE_ENV === 'production') {
    for (const pattern of blockedPatterns) {
      if (pattern.test(userAgent)) {
        console.warn(`⚠️  Blocked suspicious user agent: ${userAgent}`);
        // Uncomment to actually block
        // return res.status(403).json({
        //   success: false,
        //   error: 'Forbidden',
        //   message: 'Access denied'
        // });
      }
    }
  }
  
  next();
};

export default {
  apiLimiter,
  chatLimiter,
  aiLimiter,
  createConversationLimiter,
  requestSizeLimiter,
  ipFilter,
  helmetConfig,
  sanitizeUserAgent,
};
