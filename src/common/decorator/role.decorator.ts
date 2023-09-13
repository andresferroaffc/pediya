import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (route: string) => SetMetadata(ROLES_KEY, route);
