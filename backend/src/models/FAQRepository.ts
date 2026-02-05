import { query } from '../config/database';
import { FAQKnowledge, CreateFAQInput } from '../types/database';

export class FAQRepository {
  /**
   * Create a new FAQ entry
   */
  async create(input: CreateFAQInput): Promise<FAQKnowledge> {
    const result = await query(
      `INSERT INTO faq_knowledge (category, question, answer, region) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [input.category, input.question, input.answer, input.region || null]
    );
    return result.rows[0];
  }

  /**
   * Find FAQ by ID
   */
  async findById(id: string): Promise<FAQKnowledge | null> {
    const result = await query(
      'SELECT * FROM faq_knowledge WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all FAQs (with pagination)
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<FAQKnowledge[]> {
    const result = await query(
      'SELECT * FROM faq_knowledge ORDER BY category, region NULLS LAST LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Find FAQs by category
   */
  async findByCategory(category: string): Promise<FAQKnowledge[]> {
    const result = await query(
      'SELECT * FROM faq_knowledge WHERE category = $1 ORDER BY region NULLS LAST',
      [category]
    );
    return result.rows;
  }

  /**
   * Find FAQs by region (including global FAQs)
   */
  async findByRegion(region: string): Promise<FAQKnowledge[]> {
    const result = await query(
      `SELECT * FROM faq_knowledge 
       WHERE region = $1 OR region IS NULL 
       ORDER BY category, region NULLS LAST`,
      [region]
    );
    return result.rows;
  }

  /**
   * Find FAQs by category and region (including global)
   */
  async findByCategoryAndRegion(category: string, region: string): Promise<FAQKnowledge[]> {
    const result = await query(
      `SELECT * FROM faq_knowledge 
       WHERE category = $1 AND (region = $2 OR region IS NULL) 
       ORDER BY region NULLS LAST`,
      [category, region]
    );
    return result.rows;
  }

  /**
   * Search FAQs by keyword (searches in questions and answers)
   */
  async search(keyword: string, region?: string): Promise<FAQKnowledge[]> {
    let queryText = `
      SELECT * FROM faq_knowledge 
      WHERE (question ILIKE $1 OR answer ILIKE $1)
    `;
    const params: any[] = [`%${keyword}%`];

    if (region) {
      queryText += ' AND (region = $2 OR region IS NULL)';
      params.push(region);
    }

    queryText += ' ORDER BY category, region NULLS LAST';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const result = await query(
      'SELECT DISTINCT category FROM faq_knowledge ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }

  /**
   * Get all unique regions
   */
  async getRegions(): Promise<string[]> {
    const result = await query(
      'SELECT DISTINCT region FROM faq_knowledge WHERE region IS NOT NULL ORDER BY region'
    );
    return result.rows.map(row => row.region);
  }

  /**
   * Update FAQ
   */
  async update(id: string, input: Partial<CreateFAQInput>): Promise<FAQKnowledge | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.question !== undefined) {
      fields.push(`question = $${paramIndex++}`);
      values.push(input.question);
    }
    if (input.answer !== undefined) {
      fields.push(`answer = $${paramIndex++}`);
      values.push(input.answer);
    }
    if (input.region !== undefined) {
      fields.push(`region = $${paramIndex++}`);
      values.push(input.region);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE faq_knowledge SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Delete FAQ
   */
  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM faq_knowledge WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get FAQ count
   */
  async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) FROM faq_knowledge');
    return parseInt(result.rows[0].count);
  }
}

export default new FAQRepository();
