
import { findRelevantFAQs } from "./findRelevantFAQs";
import { generateSupportResponse } from "./generateSupportResponse";
import { getConversationHistory } from "./getConversationHistory";

export async function generateResponse(
  conversationId: string,
  userMessage: string,
  options: {
    includeHistory?: boolean;
  } = {},
): Promise<{ response: string; }> {
  try {
    // 1. Find relevant FAQs based on user query
    const faqContext = await findRelevantFAQs(userMessage);

    // 2. Get conversation history if requested
    let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> =
      [];

    if (options.includeHistory !== false) {
      conversationHistory = await getConversationHistory(conversationId, 10);
    }

    // 3. Generate AI response using FAQ context and history
    const response = await generateSupportResponse(
      userMessage,
      faqContext,
      conversationHistory,
    );

    return {
      response
    };
  } catch (error: any) {
    console.error("❌ Chat service error:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}
