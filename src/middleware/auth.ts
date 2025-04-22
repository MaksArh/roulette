import { Request, Response, NextFunction } from 'express';
import { ADMIN_PASSWORD } from '../config/constants';

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const { password } = req.body;

  if (!password) {
    return res.status(401).json({ error: 'Пароль не предоставлен' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  next();
} 