export function sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }