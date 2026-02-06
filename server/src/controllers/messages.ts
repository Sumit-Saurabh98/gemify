import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { chatService } from "../services/chat";
import { 
  invalidateConversationCache, 
  markPendingUpdate, 
  removePendingUpdate,
  cacheConversationMessages,
  getCachedConversationMessages
} from "../services/cache";

export const createMessage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { text } = req.body;
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;

      console.log("Received message data:", { conversationId, text });

    if (!conversationId || !text) {
      return res.status(400).json({
        success: false,
        message: "conversationId, sender and text are required",
      });
    }

    const result = await chatService(conversationId, text);

    const {aiMessageId, message, response, success, userMessageId} = result;

    // Invalidate cache and mark as pending update
    await invalidateConversationCache(conversationId);
    await markPendingUpdate(conversationId);

    return res.status(200).json({
        success: true,
        data: {
          conversationId,
          userMessageId: userMessageId,
          aiMessageId: aiMessageId,
          response: response,
          message: message,
          success: success,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create message",
    });
  }
};

export const getMessagesByConversationId = async (req: Request, res: Response) => {
  try {
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    
    // Check cache first
    const cachedMessages = await getCachedConversationMessages(conversationId);
    if (cachedMessages) {
      return res.status(200).json({
        success: true,
        data: {
          messages: cachedMessages,
          fromCache: true
        },
      });
    }

    // Fetch from database if not cached
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Cache the messages for future requests
    await cacheConversationMessages(conversationId, messages);

    res.status(200).json({
      success: true,
      data: {
        messages,
        fromCache: false
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
    });
  }
};
