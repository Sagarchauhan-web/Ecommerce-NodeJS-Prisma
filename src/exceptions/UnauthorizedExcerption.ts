import { ErrorCodes, HttpException } from './root';

export class UnauthorisedException extends HttpException {
  constructor(message: string, errorCode: ErrorCodes) {
    super(message, errorCode, 401, null);
  }
}
