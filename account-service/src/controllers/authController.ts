import { Request, Response, Router } from 'express';

import { handleRequestValidationMiddleware } from '../middlewares/handleRequestValidationMiddleware';
import { loginRequestSchema } from '../requests/loginRequest';
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
router.post(
  '/login',
  handleRequestValidationMiddleware(loginRequestSchema),
  async (req: Request, res: Response) => {
    const { statusCode, data } = await AuthService.login(req.body);
    res.status(statusCode).json(data);
  },
);

export default router;
