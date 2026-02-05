/**
 * Input validation and sanitization utilities
 */

export class InputValidator {
  /**
   * Validate chat message
   */
  static validateChatMessage(message: string): { valid: boolean; error?: string } {
    // Check if message exists
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required and must be a string' };
    }

    // Trim whitespace
    const trimmedMessage = message.trim();

    // Check minimum length
    if (trimmedMessage.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    // Check maximum length (prevent token overflow)
    if (trimmedMessage.length > 2000) {
      return { valid: false, error: 'Message is too long (max 2000 characters)' };
    }

    // Check for suspicious patterns (basic XSS/injection prevention)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /eval\(/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedMessage)) {
        return { valid: false, error: 'Message contains potentially harmful content' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate conversation ID
   */
  static validateConversationId(id: string): { valid: boolean; error?: string } {
    if (!id || typeof id !== 'string') {
      return { valid: false, error: 'Conversation ID is required' };
    }

    // UUID v4 pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return { valid: false, error: 'Invalid conversation ID format' };
    }

    return { valid: true };
  }

  /**
   * Validate region
   */
  static validateRegion(region?: string): { valid: boolean; error?: string } {
    if (!region) {
      return { valid: true }; // Region is optional
    }

    const validRegions = ['USA', 'India', 'Japan', 'China'];

    if (!validRegions.includes(region)) {
      return { valid: false, error: `Invalid region. Must be one of: ${validRegions.join(', ')}` };
    }

    return { valid: true };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
}

/**
 * Rate limiting for AI requests
 */
export class AIRateLimiter {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  checkLimit(identifier: string): { allowed: boolean; resetIn?: number } {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);

    // No record or window expired
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { allowed: true };
    }

    // Within window - check count
    if (record.count < this.maxRequests) {
      record.count++;
      return { allowed: true };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  /**
   * Reset limit for identifier
   */
  reset(identifier: string): void {
    this.requestCounts.delete(identifier);
  }
}

/**
 * Response validation
 */
export class ResponseValidator {
  /**
   * Validate AI response
   */
  static validateAIResponse(response: string): { valid: boolean; error?: string } {
    if (!response || typeof response !== 'string') {
      return { valid: false, error: 'Invalid AI response format' };
    }

    const trimmed = response.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: 'AI response is empty' };
    }

    // Check for error indicators in response
    if (trimmed.toLowerCase().includes('i cannot') && trimmed.length < 50) {
      return { valid: false, error: 'AI refused to respond' };
    }

    return { valid: true };
  }

  /**
   * Check if response contains harmful content
   */
  static containsHarmfulContent(response: string): boolean {
    const harmfulPatterns = [
      /\b(kill|murder|harm|attack)\s+(yourself|others)/i,
      /\b(illegal|unlawful)\s+(activity|activities|action)/i,
      /\bpersonal\s+information\b/i,
    ];

    return harmfulPatterns.some(pattern => pattern.test(response));
  }
}

/**
 * Error types for better error handling
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetIn: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export default {
  InputValidator,
  AIRateLimiter,
  ResponseValidator,
  AIServiceError,
  ValidationError,
  RateLimitError,
};
