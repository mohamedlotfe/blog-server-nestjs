import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../models/role.enum';

export const ROLES_KEY = 'roles';
export const hasRoles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
