import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ROLES_DATA } from '../decorators/roles.decorator';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //Recupero roles de la metadata
    const roles: string[] = this.reflector.get<string[]>(
      ROLES_DATA,
      context.getHandler(),
    );

    //Recupero user del request
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    //Valido la data
    if (!user) throw new BadRequestException('User not found');

    if (!roles || roles.length === 0) return true;

    if (user.roles.some((r) => roles.includes(r))) return true;

    throw new ForbiddenException(
      `User: ${user.fullName} needs valid roles: ${roles}`,
    );
  }
}
