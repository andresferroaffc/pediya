import { PartialType} from '@nestjs/mapped-types';
import { ParameterDto } from './parameter.dto';

export class EditParameterDto extends PartialType(ParameterDto) {}
