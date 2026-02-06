import { query } from '../config/database';
import { Message, CreateMessageInput } from '../types/database';

export class MessageRepository {
  /**
   * Create a new message
   */
  async create(input: CreateMessageInput): Promise<Message> {
    const result = await query(
      `INSERT INTO messages (conversation_id, sender, text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [
        input.conversation_id,
        input.sender,
        input.text
      ]
    );
    return result.rows[0];
  }

  /**
   * Find message by ID
   */
  async findById(id: string): Promise<Message | null> {
    const result = await query(
      'SELECT * FROM messages WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all messages for a conversation (chronological order)
   */
  async findByConversationId(
    conversationId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Message[]> {
    const result = await query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC 
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Get recent messages for a conversation (for context window)
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    const result = await query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [conversationId, limit]
    );
    // Reverse to get chronological order
    return result.rows.reverse();
  }

  /**
   * Get messages by sender type
   */
  async findBySender(
    conversationId: string,
    sender: 'user' | 'ai'
  ): Promise<Message[]> {
    const result = await query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 AND sender = $2 
       ORDER BY created_at ASC`,
      [conversationId, sender]
    );
    return result.rows;
  }

  /**
   * Count messages in a conversation
   */
  async countByConversation(conversationId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) FROM messages WHERE conversation_id = $1',
      [conversationId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Delete a message
   */
  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM messages WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Delete all messages in a conversation
   */
  async deleteByConversation(conversationId: string): Promise<number> {
    const result = await query(
      'DELETE FROM messages WHERE conversation_id = $1',
      [conversationId]
    );
    return result.rowCount || 0;
  }

  /**
   * Search messages by text (simple text search)
   */
  async search(conversationId: string, searchText: string): Promise<Message[]> {
    const result = await query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 AND text ILIKE $2 
       ORDER BY created_at DESC`,
      [conversationId, `%${searchText}%`]
    );
    return result.rows;
  }
}

export default new MessageRepository();
