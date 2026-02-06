import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { warmConversationCache } from "../services/cache";

export const getConversations = async (_: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        createdAt: 'asc'  // Order by creation date ascending (oldest first)
      }
    });

    // Reverse the order so the oldest conversation appears first
    const conversation = conversations.reverse();

    // Warm cache for all conversations on app load
    await warmConversationCache(conversations);

    res.status(200).json({
      success: true,
      data: {
        conversation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve conversations",
    });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        title,
      },
    });
    res.status(201).json({
      success: true,
      data: {
        conversation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};
