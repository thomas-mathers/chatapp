import { Router } from 'express';

const router = Router();

router.post('/send-email', async (req, res) => {
  res.status(200).json();
});

export { router };
