import { Router, Request, Response } from 'express';
import * as AuthService from '../services/authService';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   get:
 *     description: Log in.
 *     responses:
 *       200:
 *         description: Returns a JWT.
 */
router.post('/auth/login', (req: Request, res: Response) => {
  const { statusCode, data } = AuthService.login(req.body);
  res.status(statusCode).json(data);
});

export default router;
