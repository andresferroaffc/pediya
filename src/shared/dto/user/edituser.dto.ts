import { PartialType, OmitType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';

export class EditUserDto extends PartialType(
  OmitType(UserDto, ['password', 'role'] as const),
) {}
