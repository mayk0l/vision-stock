import express from 'express';
import { scanProduct } from '../controllers/scanner.controller';

const router = express.Router();

router.post('/scan', scanProduct);

export default router;
