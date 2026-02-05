import { Request, Response, NextFunction } from 'express';
import { InputValidator } from '../utils/validation';

/**
 * Middleware to validate chat message request
 */
export const validateChatMessage = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { message, conversationId, region } = req.body;

    // Validate conversation ID
    const idValidation = InputValidator.validateConversationId(conversationId);
    if (!idValidation.valid) {
      res.status(400).json({
        error: 'Validation Error',
        message: idValidation.error,
        field: 'conversationId',
      });
      return;
    }

    // Validate message
    const messageValidation = InputValidator.validateChatMessage(message);
    if (!messageValidation.valid) {
      res.status(400).json({
        error: 'Validation Error',
        message: messageValidation.error,
        field: 'message',
      });
      return;
    }

    // Validate region if provided
    if (region) {
      const regionValidation = InputValidator.validateRegion(region);
      if (!regionValidation.valid) {
        res.status(400).json({
          error: 'Validation Error',
          message: regionValidation.error,
          field: 'region',
        });
        return;
      }
    }

    // Sanitize message
    req.body.message = InputValidator.sanitizeInput(message);

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate request',
    });
  }
};

/**
 * Middleware to validate conversation creation request
 */
export const validateCreateConversation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { region, userId } = req.body;

    // Validate region if provided
    if (region) {
      const regionValidation = InputValidator.validateRegion(region);
      if (!regionValidation.valid) {
        res.status(400).json({
          error: 'Validation Error',
          message: regionValidation.error,
          field: 'region',
        });
        return;
      }
    }

    // Validate userId if provided (basic check)
    if (userId && (typeof userId !== 'string' || userId.length > 100)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'User ID must be a string with max 100 characters',
        field: 'userId',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate request',
    });
  }
};

/**
 * Middleware to validate conversation ID parameter
 */
export const validateConversationIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const conversationId = req.params.conversationId;

    // Handle case where conversationId might be an array
    if (!conversationId || typeof conversationId !== 'string') {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Conversation ID must be provided as a string',
        field: 'conversationId',
      });
      return;
    }

    const validation = InputValidator.validateConversationId(conversationId);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Validation Error',
        message: validation.error,
        field: 'conversationId',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate request',
    });
  }
};

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { limit, offset } = req.query;

    // Validate limit
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Limit must be between 1 and 100',
          field: 'limit',
        });
        return;
      }
      req.query.limit = limitNum.toString();
    }

    // Validate offset
    if (offset) {
      const offsetNum = parseInt(offset as string, 10);
      if (isNaN(offsetNum) || offsetNum < 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Offset must be a non-negative number',
          field: 'offset',
        });
        return;
      }
      req.query.offset = offsetNum.toString();
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate request',
    });
  }
};

/**
 * Middleware to ensure request body exists
 */
export const requireBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Request body is required',
    });
    return;
  }
  next();
};

/**
 * Middleware to validate required fields
 */
export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        fields: missingFields,
      });
      return;
    }

    next();
  };
};

export default {
  validateChatMessage,
  validateCreateConversation,
  validateConversationIdParam,
  validatePagination,
  requireBody,
  requireFields,
};
