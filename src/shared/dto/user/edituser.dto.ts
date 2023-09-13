import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Userdto } from './user.dto';

export class EditUserDto extends PartialType(
  OmitType(Userdto, ['password', 'role'] as const),
) {}
