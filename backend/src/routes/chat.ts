import { Router, Request, Response } from 'express';
import chatService from '../services/ChatService';
import {
  validateChatMessage,
  validateCreateConversation,
  validateConversationIdParam,
  validatePagination,
  requireBody,
  requireFields,
} from '../middleware/validation';
import {
  aiLimiter,
  createConversationLimiter,
} from '../middleware/security';
import { ValidationError, RateLimitError, AIServiceError } from '../utils/validation';

const router = Router();

/**
 * POST /api/chat/conversations
 * Create a new conversation
 * Rate limit: 5 per 15 minutes
 */
router.post(
  '/conversations',
  createConversationLimiter,
  requireBody,
  validateCreateConversation,
  async (req: Request, res: Response) => {
    try {
      const { region, userId } = req.body;

      const conversation = await chatService.createConversation({
        region,
        userId,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        data: {
          conversationId: conversation.id,
          createdAt: conversation.created_at,
        },
      });
    } catch (error: any) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create conversation',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/chat/conversations/:conversationId
 * Get conversation details
 */
router.get(
  '/conversations/:conversationId',
  validateConversationIdParam,
  async (req: Request, res: Response) => {
    try {
      const conversationId = req.params.conversationId as string;

      const conversation = await chatService.getConversation(conversationId);

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve conversation',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get messages for a conversation
 */
router.get(
  '/conversations/:conversationId/messages',
  validateConversationIdParam,
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const conversationId = req.params.conversationId as string;
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const messages = await chatService.getConversationMessages(conversationId, limit);

      res.status(200).json({
        success: true,
        data: {
          conversationId,
          messages,
          count: messages.length,
        },
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve messages',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/chat/message
 * Send a message and get AI response
 * Rate limit: 10 per minute (AI limiter)
 */
router.post(
  '/message',
  aiLimiter,
  requireBody,
  requireFields(['message', 'conversationId']),
  validateChatMessage,
  async (req: Request, res: Response) => {
    try {
      const { message, conversationId, region, userId } = req.body;

      const result = await chatService.processChat(conversationId, message, {
        region,
        userId,
      });

      res.status(200).json({
        success: true,
        data: {
          conversationId,
          userMessageId: result.userMessageId,
          aiMessageId: result.aiMessageId,
          response: result.response,
          sources: result.sources,
        },
      });
    } catch (error: any) {
      console.error('Process chat error:', error);

      // Handle specific error types
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message,
          field: error.field,
        });
        return;
      }

      if (error instanceof RateLimitError) {
        res.status(429).json({
          success: false,
          error: 'Rate Limit Exceeded',
          message: error.message,
          resetIn: error.resetIn,
        });
        return;
      }

      if (error instanceof AIServiceError) {
        res.status(error.statusCode).json({
          success: false,
          error: 'AI Service Error',
          message: error.message,
          code: error.code,
        });
        return;
      }

      // Generic error
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process message',
      });
    }
  }
);

/**
 * POST /api/chat/moderate
 * Moderate a message for safety
 */
router.post(
  '/moderate',
  requireBody,
  requireFields(['message']),
  async (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      const result = await chatService.moderateMessage(message);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Moderation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to moderate message',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/chat/suggestions
 * Get suggested follow-up questions
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { region } = req.query;

    const suggestions = await chatService.getSuggestedQuestions(region as string);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error: any) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
      message: error.message,
    });
  }
});

export default router;
