/**
 * Repository exports for easy importing
 */

export { ConversationRepository } from './ConversationRepository';
export { MessageRepository } from './MessageRepository';
export { FAQRepository } from './FAQRepository';

// Default instances
import conversationRepository from './ConversationRepository';
import messageRepository from './MessageRepository';
import faqRepository from './FAQRepository';

export const repositories = {
  conversations: conversationRepository,
  messages: messageRepository,
  faqs: faqRepository,
};

export default repositories;
