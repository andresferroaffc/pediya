import { ValidatorOptions } from 'class-validator';

export const classValidatorI18nOptions: ValidatorOptions = {
  validationError: {
    target: false,
    value: false,
  },
  /*customMessages: {
    isNotEmpty: 'Este campo no debe estar vacío.',
    isEmail: 'El formato del correo electrónico no es válido.',
  },*/
};
