import express from 'express';
import { scanProduct } from '../controllers/scanner.controller';
import { asyncHandler } from '../utils';

const router = express.Router();

router.post('/scan', asyncHandler(scanProduct));

export default router;
