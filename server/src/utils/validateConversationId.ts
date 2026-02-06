export function validateConversationId(id: string): { valid: boolean; error?: string } {
  if (!id || typeof id !== 'string') {
      return { valid: false, error: 'Conversation ID is required' };
    }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
      return { valid: false, error: 'Invalid conversation ID format' };
    }

    return { valid: true };
}
