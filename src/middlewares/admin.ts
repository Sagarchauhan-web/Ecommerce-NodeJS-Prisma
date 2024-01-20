import { NextFunction, Request, Response } from 'express';
import { UnauthorisedException } from '../exceptions/UnauthorizedExcerption';
import { ErrorCodes } from '../exceptions/root';

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  if (user?.role == 'ADMIN') next();
  else
    return next(
      new UnauthorisedException(
        'Unauthorised User not an admin',
        ErrorCodes.UNAUTHORISED,
      ),
    );
};

export default adminMiddleware;
