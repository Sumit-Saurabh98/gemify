import express from 'express';
import { createMessage, getMessagesByConversationId } from '../controllers/messages';

const router = express.Router();

router.post('/:conversationId', createMessage);
router.get('/:conversationId', getMessagesByConversationId);

export default router;
