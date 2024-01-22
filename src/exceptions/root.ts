// Message, status code, error codes, error

export class HttpException extends Error {
  message: string;
  errorCode: ErrorCodes;
  statusCode: number;
  errors: any;

  constructor(
    message: string,
    errorCode: ErrorCodes,
    statusCode: number,
    errors: any,
  ) {
    super();

    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export enum ErrorCodes {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXIST = 1002,
  INCORRECT_PASSWORD = 1003,
  UNPROCESSABLE_ENTITY = 1004,
  INTERNAL_EXCEPTION = 1005,
  UNAUTHORISED = 1006,
  PRODUCT_NOT_FOUND = 1007,
  ADDRESS_NOT_FOUND = 1008,
}
