/**
 * Service layer exports
 */

export { CacheService } from './CacheService';
export { AIService } from './AIService';
export { ChatService } from './ChatService';

import cacheService from './CacheService';
import aiService from './AIService';
import chatService from './ChatService';

export const services = {
  cache: cacheService,
  ai: aiService,
  chat: chatService,
};

export default services;
