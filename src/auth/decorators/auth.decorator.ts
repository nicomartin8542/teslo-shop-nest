import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interface';
import { Roles } from './';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
