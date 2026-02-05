/**
 * Service layer exports
 */

export { CacheService } from './CacheService';
export { AIService } from './AIService';

import cacheService from './CacheService';
import aiService from './AIService';

export const services = {
  cache: cacheService,
  ai: aiService,
};

export default services;
