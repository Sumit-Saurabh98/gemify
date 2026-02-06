import { query } from '../config/database';
import { Conversation } from '../types/database';

export class ConversationRepository {
  /**
   * Create a new conversation
   */
  async create(title?: string): Promise<Conversation> {
    const conversationTitle = title || 'New Conversation';
    const result = await query(
      'INSERT INTO conversations (title) VALUES ($1) RETURNING *',
      [conversationTitle]
    );
    return result.rows[0];
  }

  /**
   * Find conversation by ID
   */
  async findById(id: string): Promise<Conversation | null> {
    const result = await query(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all conversations (with pagination)
   */
  async findAll(limit: number = 50, offset: number = 0): Promise<Conversation[]> {
    const result = await query(
      'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }


  /**
   * Delete conversation (cascades to messages)
   */
  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM conversations WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get conversation with message count
   */
  async getWithMessageCount(id: string): Promise<{ conversation: Conversation; messageCount: number } | null> {
    const result = await query(
      `SELECT 
        c.*,
        COUNT(m.id) as message_count
       FROM conversations c
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      conversation: {
        id: row.id,
        title: row.title,
        created_at: row.created_at,
        updated_at: row.updated_at
      },
      messageCount: parseInt(row.message_count)
    };
  }

  /**
   * Get all conversations with preview (last message)
   */
  async getAllWithPreview(limit: number = 50): Promise<Array<{
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    lastMessage?: {
      text: string;
      sender: string;
      created_at: string;
    };
  }>> {
    const result = await query(
      `SELECT 
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        m.text as last_message_text,
        m.sender as last_message_sender,
        m.created_at as last_message_created_at
       FROM conversations c
       LEFT JOIN LATERAL (
         SELECT text, sender, created_at
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC
         LIMIT 1
       ) m ON true
       ORDER BY c.updated_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      updated_at: row.updated_at,
      lastMessage: row.last_message_text ? {
        text: row.last_message_text,
        sender: row.last_message_sender,
        created_at: row.last_message_created_at,
      } : undefined,
    }));
  }
}

export default new ConversationRepository();
