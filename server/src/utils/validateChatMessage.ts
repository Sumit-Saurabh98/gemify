export function validateChatMessage(message: string): { valid: boolean; error?: string } {
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