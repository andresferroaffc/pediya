import { PartialType} from '@nestjs/mapped-types';
import { DiscountDto } from './discount.dto';

export class EditDiscountDto extends PartialType(DiscountDto) {}
