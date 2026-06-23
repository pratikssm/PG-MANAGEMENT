import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/ApiResponse';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function protect(req: AuthRequest, _res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this resource.', 403));
    }
    next();
  };
}
