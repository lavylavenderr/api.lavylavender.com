import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { KEY_KEY } from 'src/decorators/key.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredKey = this.reflector.getAllAndOverride<string>(KEY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredKey) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader) return false;
    if (authHeader !== requiredKey) return false;

    return true;
  }
}