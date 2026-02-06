export function validateAIResponse(response: string): {
  valid: boolean;
  error?: string;
} {
  if (!response || typeof response !== "string") {
    return { valid: false, error: "Invalid AI response format" };
  }

  const trimmed = response.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "AI response is empty" };
  }

  // Check for error indicators in response
  if (trimmed.toLowerCase().includes("i cannot") && trimmed.length < 50) {
    return { valid: false, error: "AI refused to respond" };
  }

  return { valid: true };
}


export function containsHarmfulContent(response: string): boolean {
    const harmfulPatterns = [
      /\b(kill|murder|harm|attack)\s+(yourself|others)/i,
      /\b(illegal|unlawful)\s+(activity|activities|action)/i,
      /\bpersonal\s+information\b/i,
    ];

    return harmfulPatterns.some(pattern => pattern.test(response));
  }