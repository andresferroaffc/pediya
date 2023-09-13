import { BadRequestException } from '@nestjs/common';
import { menssageErrorResponse } from '../../messages';

// Validar si el objeto existe para arrojar excepción
export function validatExistException(
  object: any,
  message: string,
  code: string,
) {
  switch (code) {
    case 'validatExist':
      // code block
      if (object.length > 0)
        throw new BadRequestException(menssageErrorResponse(message).exist);
      break;
    case 'ValidateNoexist':
      // code block
      if (!object || object.length === 0 || object === false)
        throw new BadRequestException(menssageErrorResponse(message).noExist);
      break;
    case 'validatExistOne':
      if (object && object !== null)
        throw new BadRequestException(menssageErrorResponse(message).exist);
      break;
    case 'valiateCount':
      if (object.length === 0)
        throw new BadRequestException(
          menssageErrorResponse(
            'No se encontraron registros para esta consulta',
          ).general,
        );
      break;
    default:
      // code block
      throw new BadRequestException(menssageErrorResponse('codigo').noExist);
  }
}
