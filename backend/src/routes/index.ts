/**
 * API Routes
 */

import { Router } from 'express';
import chatRoutes from './chat';

const router = Router();

// Mount chat routes
router.use('/chat', chatRoutes);

export default router;
