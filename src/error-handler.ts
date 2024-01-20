import { NextFunction, Request, RequestHandler } from 'express';
import { ErrorCodes, HttpException } from './exceptions/root';
import { InternalException } from './exceptions/internal-exception';

export const errorHandler = (method: Function): any => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      console.log(error, 'error');
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else {
        exception = new InternalException(
          'Something went wrong',
          error,
          ErrorCodes.INTERNAL_EXCEPTION,
        );
      }
      next(exception);
    }
  };
};
