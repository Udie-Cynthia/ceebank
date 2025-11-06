import { Router } from 'express';

const router = Router();

/** GET /api/info */
router.get('/info', (_req, res) => {
  res.json({
    name: 'CeeBank API',
    version: '0.1.0',
    description: 'CeeBank backend',
  });
});

export default router;

