/**
 * Service layer exports
 */

export { CacheService } from './CacheService';

import cacheService from './CacheService';

export const services = {
  cache: cacheService,
};

export default services;
