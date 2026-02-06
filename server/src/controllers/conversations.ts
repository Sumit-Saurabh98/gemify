import type { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getConversations = async (_: Request, res: Response) => {
  try {
    const conversation = await prisma.conversation.findMany();

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
