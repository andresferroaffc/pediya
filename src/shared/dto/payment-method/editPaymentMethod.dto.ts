import { PartialType} from '@nestjs/mapped-types';
import { PaymentMethodDto } from './paymentMethod.dto';

export class EditPaymentMethodDto extends PartialType(PaymentMethodDto) {}
