import { getOpenAIClient } from "../services/getOpenAIClient";

export async function moderateContent(text: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
  }> {
    try {
      const client = getOpenAIClient();
      
      const moderation = await client.moderations.create({
        input: text,
      });

      const result = moderation.results[0];

      return {
        flagged: result.flagged,
        categories: result.categories as unknown as Record<string, boolean>,
      };
    } catch (error: any) {
      console.error('❌ OpenAI moderation error:', error);
      // Return safe default if moderation fails
      return {
        flagged: false,
        categories: {},
      };
    }
  }