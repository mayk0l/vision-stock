import { Router } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Example endpoint
router.get('/', (req: AuthRequest, res) => {
  res.json({ message: 'Controller endpoint' });
});

export default router;
