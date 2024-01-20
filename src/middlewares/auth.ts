import { NextFunction, Request, Response } from 'express';
import { UnauthorisedException } from '../exceptions/UnauthorizedExcerption';
import { ErrorCodes } from '../exceptions/root';
import { JWT_SECRET } from '../secrets';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../index';
import { User } from '@prisma/client';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;

  if (!token)
    return next(
      new UnauthorisedException('Unauthorised', ErrorCodes.UNAUTHORISED),
    );

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prismaClient.user.findFirst({
      where: { id: payload?.userId },
    });

    if (!user)
      return next(
        new UnauthorisedException('Unauthorised', ErrorCodes.UNAUTHORISED),
      );

    req.user = user;
    next();
  } catch (error) {
    return next(
      new UnauthorisedException('Unauthorised', ErrorCodes.UNAUTHORISED),
    );
  }
};

export default authMiddleware;
