import prisma from "../lib/prisma";
import { generateResponse } from "../utils/generateResponse";
import { invalidateConversationCache } from "../utils/getCachedFAQSearch";
import { moderateContent } from "../utils/moderateContent";
import { sanitizeInput } from "../utils/sanitizeInput";
import { containsHarmfulContent, validateAIResponse } from "../utils/validateAIResponse";
import { validateChatMessage } from "../utils/validateChatMessage";
import { validateConversationId } from "../utils/validateConversationId";

export const chatService = async (conversationId: string, text: string) => {
  try {
    if (!conversationId || !text) {
      return {
        success: false,
        message: "conversationId and text are required",
      };
    }

    //  1. Validate conversationId
    const isConversationIdValid = validateConversationId(conversationId);

    if (!isConversationIdValid.valid) {
      return {
        success: false,
        message: isConversationIdValid.error || "Invalid conversationId",
      };
    }

    // 2. Validate and sanitize user message
    const isMessageSafe = validateChatMessage(text);

    if (!isMessageSafe.valid) {
      return {
        success: false,
        message: isMessageSafe.error || "Invalid message",
      };
    }

    // 3. Sanitize message text

    const sanitizedText = sanitizeInput(text);

    // TODO: 4. Check rate limits.

    // 5. Content moderation

    const moderation = await moderateContent(sanitizedText);

    if (moderation.flagged) {
      return {
        success: false,
        message: "Your message contains content that violates our guidelines. Please rephrase and try again.",
      };
    }

    // 6. Save user message to database

    const userMsg = await prisma.message.create({
      data: {
        conversationId,
        sender: "user",
        text: sanitizedText,
      },
    });

    // 7. Generate AI response with error handling

    let response: string;

    try {
      const result = await generateResponse(conversationId, sanitizedText, {
        includeHistory: true,
      });

      response = result.response;

      // 8. Validate AI response

      const responseValidation = validateAIResponse(response);

      if (!responseValidation.valid) {
        return {
          success: false,
          message: responseValidation.error || "Invalid AI response",
        };
      }

      // 9. Check for harmful content in response
      if(containsHarmfulContent(response)) {
        return {
          success: false,
          message: "I apologize, but I'm unable to provide a response to that query. Please contact our human support team for assistance.",
        };
      }

    } catch (error) {
      console.error('❌ AI generation error:', error);
        
        // Fallback response
        response = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact our support team.";
    }

    // 10. Save AI response
    const aiMsg = await prisma.message.create({
      data: {
        conversationId,
        sender: "ai",
        text: response,
      }
    })

    // 11. Invalidate message cache
    await invalidateConversationCache(conversationId);

      return {
        userMessageId: userMsg.id,
        aiMessageId: aiMsg.id,
        response,
      };
  } catch (error) {
    console.error('❌ Process chat error:', error);

    return {
      success: false,
      message: "An error occurred while processing your message. Please try again later.",
    };
  }
};
