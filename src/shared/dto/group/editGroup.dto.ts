import { PartialType} from '@nestjs/mapped-types';
import { GroupDto } from './group.dto';

export class EditGroupDto extends PartialType(GroupDto) {}
