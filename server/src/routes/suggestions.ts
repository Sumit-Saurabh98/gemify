import express from 'express';
import { getSuggestedQuestions } from '../controllers/suggestions';

const router = express.Router();

router.get('/', getSuggestedQuestions);

export default router;