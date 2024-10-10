import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpServer,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

export type ErrorCodeStatusMapping = {
  [key: string]: number;
};

@Catch(Prisma?.PrismaClientKnownRequestError, Prisma?.NotFoundError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private errorCodesStatusMapping: ErrorCodeStatusMapping = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
  };

  constructor(
    appRef?: HttpServer,
    errorCodeStatusMapping?: ErrorCodeStatusMapping,
  ) {
    super(appRef);
    this.errorCodesStatusMapping = Object.assign(
      this.errorCodesStatusMapping,
      errorCodeStatusMapping,
    );
  }

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.NotFoundError
      | any,
    host: ArgumentsHost,
  ) {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.catchClientKnownRequestError(exception, host);
    }
    if (exception instanceof Prisma.NotFoundError) {
      return this.catchNotFoundError(exception, host);
    }
  }

  private catchClientKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const statusCode = this.errorCodesStatusMapping[exception.code];
    const message = `[${exception.code}]: ${this.exceptionShortMessage(exception.message)}`;

    if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
      return super.catch(exception, host);
    }

    super.catch(new HttpException({ statusCode, message }, statusCode), host);
  }

  private catchNotFoundError(
    { message }: Prisma.NotFoundError,
    host: ArgumentsHost,
  ) {
    const statusCode = HttpStatus.NOT_FOUND;

    super.catch(new HttpException({ statusCode, message }, statusCode), host);
  }

  private exceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));

    return shortMessage
      .substring(shortMessage.indexOf('\n'))
      .replace(/\n/g, '')
      .trim();
  }
}
