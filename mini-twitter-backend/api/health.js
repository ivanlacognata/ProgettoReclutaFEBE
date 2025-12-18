import express from 'express';
const router = express.Router();

// GET /api/healthz 
router.get('/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funzionante' });
});

export default router;
