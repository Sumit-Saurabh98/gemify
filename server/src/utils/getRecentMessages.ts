import { Message } from "../types";
import prisma from "../lib/prisma";

export async function getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    try {
        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });
        
        // Map Prisma fields to match the Message interface
        const mappedMessages: Message[] = messages.map(msg => ({
            id: msg.id,
            conversationId: msg.conversationId,
            sender: msg.sender as 'user' | 'ai',
            text: msg.text,
            created_at: msg.createdAt,
        }));
        
        return mappedMessages.reverse();
    } catch (error) {
        console.error('Get recent messages error:', error);
        return [];
    }
  }