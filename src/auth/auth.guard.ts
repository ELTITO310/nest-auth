import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './dto/login.dto';
import { validate } from 'class-validator';
import { Request, Response } from 'express';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const body = plainToClass(LoginDto, req.body);

    const errors = await validate(body);

    const errorsMessage = errors.flatMap(({ constraints }) =>
      Object.values(constraints),
    );

    console.log({
      body: req.body,
      errors,
    });

    if (errorsMessage.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: errorsMessage,
      });
    }

    return super.canActivate(ctx) as boolean | Promise<boolean>;
  }
}

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
