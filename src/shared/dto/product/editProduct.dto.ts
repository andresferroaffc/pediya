import { PartialType} from '@nestjs/mapped-types';
import { ProductDto } from './product.dto';

export class EditProductDto extends PartialType(ProductDto) {}
