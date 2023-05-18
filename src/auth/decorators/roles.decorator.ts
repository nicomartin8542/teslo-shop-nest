import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interface';

export const ROLES_DATA = 'roles';
export const Roles = (...args: ValidRoles[]) => SetMetadata(ROLES_DATA, args);
