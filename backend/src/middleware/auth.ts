import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/ApiResponse';
import User from '../models/User';
import Registration from '../models/Registration';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export async function protect(req: AuthRequest, _res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyToken(token);
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  try {
    const user = await User.findById(decoded.id).select('role email isEmailVerified sessionVersion');
    if (!user) return next(new AppError('Invalid or expired token. Please log in again.', 401));
    if (!user.isEmailVerified) return next(new AppError('Verify your email before continuing.', 403));
    if ((decoded.sessionVersion ?? 0) !== user.sessionVersion) {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      sessionVersion: user.sessionVersion,
    };
    return next();
  } catch (error) {
    return next(error);
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

export async function requireApprovedResident(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role === 'admin') return next();
  if (!req.user || req.user.role !== 'resident') return next(new AppError('Only residents can access this resource.', 403));

  try {
    const registration = await Registration.findOne({ userId: req.user.id, status: 'approved' }).select('_id');
    if (!registration) {
      return next(new AppError('An approved resident registration is required to use this feature.', 403));
    }
    return next();
  } catch (error) {
    return next(error);
  }
}
