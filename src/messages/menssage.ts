export const menssageSuccessResponse = (modulo: string) => {
  return {
    post: `El/La ${modulo}, se creo correctamente`,
    annul: `El/La ${modulo}, se anulo correctamente`,
    posts: `Todos/as los/las ${modulo}, se crearon correctamente`,
    get: `Todos/as los/las ${modulo}, se cargaron con éxito`,
    getOne: `El/La ${modulo}, se cargo con éxito`,
    put: `EL/La ${modulo}, se modifico con éxito`,
    puts: `todos/as ${modulo}, se modificaron con éxito`,
    suma: `Suma de los/las ${modulo}`,
    cantidad: `Cantidad de los/las ${modulo}`,
    gestionOrden: `Gestion de ${modulo}, exitoso`,
    dashboard: `La dashboard se cargo con éxito`,
    login: 'Login exitoso',
    resetPassword: `Se envio un link de restauracion de contraseña al correo ingresado`,
    delete: `El/La ${modulo}, se eliminó correctamente`,
    cancel: `El/La ${modulo}, se cancelo correctamente`,
    general: modulo,
  };
};

export const menssageErrorResponse = (modulo: string) => {
  return {
    exist: `El/La ${modulo}, ya esta registrado en el sistema.`,
    error: `Se ha producido un error, Comuniquece con el administrador.`,
    postError: `Se ha producido un error, no se pudo crear el/la ${modulo}.`,
    getError: `Se ha producido un error, no se pudo cargar los/las ${modulo}.`,
    getOneError: `Se ha producido un error, no se pudo cagar el/la ${modulo}.`,
    putError: `Se ha producido un error, no se pudo modificar el/la ${modulo}.`,
    deleteError: `Se ha producido un error, no se pudo eliminar el/la ${modulo}.`,
    noExist: `El/La ${modulo}, no esta registrado en el sistema.`,
    noExistMany:`Los/las ${modulo}, no estan registrados en el sistema.`,
    emailError: `Se ha producido un error al enviar el correo, Comuniquece con el administrador.
    ${modulo}`,
    notEmpty: `${modulo} should not be empty.`,
    general: modulo,
  };
};
