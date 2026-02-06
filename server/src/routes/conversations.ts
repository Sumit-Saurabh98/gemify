import express from 'express';
import { getConversations, createConversation } from '../controllers/conversations';

const router = express.Router();

router.get('/', getConversations);
router.post('/', createConversation);

export default router;