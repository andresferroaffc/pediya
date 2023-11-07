import { PartialType} from '@nestjs/mapped-types';
import { TypeDocumentDto } from './typeDocument.dto';

export class EditTypeDocumentDto extends PartialType(TypeDocumentDto) {}
