import { Request, Response } from 'express';
import { mockProductDetection } from '../services/scanner.service';

export const scanProduct = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: 'No image data provided'
      });
    }

    // Simular procesamiento de IA
    const result = await mockProductDetection(image);

    return res.json(result);
  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({
      error: 'Error processing image'
    });
  }
};
