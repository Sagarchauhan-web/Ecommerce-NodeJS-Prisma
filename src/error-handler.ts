import { NextFunction, Request, RequestHandler } from 'express';
import { ErrorCodes, HttpException } from './exceptions/root';
import { InternalException } from './exceptions/internalException';
import { BadRequestsException } from './exceptions/badReaquest';
import { ZodError } from 'zod';

export const errorHandler = (method: Function): any => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else {
        if (error instanceof ZodError) {
          exception = new BadRequestsException(
            'Unprocessable Entity',
            ErrorCodes.UNPROCESSABLE_ENTITY,
            error,
          );
        } else {
          exception = new InternalException(
            'Something went wrong',
            error,
            ErrorCodes.INTERNAL_EXCEPTION,
          );
        }
      }
      next(exception);
    }
  };
};
