import type {Request, Response} from 'express';

const suggestions = [
      'What are your shipping options?',
      'How do I return a product?',
      'What payment methods do you accept?',
      'Do you have gaming mice in stock?',
      'What is your warranty policy?',
    ];

export const getSuggestedQuestions = async(_: Request, res: Response) =>{
    try {
        res.status(200).json({
            success: true,
            data: {
                suggestions,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve suggested questions",
        });
    }
}