export const templateCreateUser = (user: string, password: string) => {
  return `
    <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usuario</title>
</head>
<body style="width: 100%; max-width: 650px; margin: 0 auto;">
  <div style="width: 100%; max-width: 650px; margin: 0 auto; text-align: center; padding: 0 0 30px;">
    <h1 style="font-family: 'PT Sans', sans-serif;">Usuario creado correctamente</h1>
    <p style="font-family: 'PT Sans', sans-serif;">usuario: ${user}</p>
    <p style="font-family: 'PT Sans', sans-serif;">contraseña: ${password}</p>
  </div>
</body>
</html>

    `;
};

export const templateResetpass = (code: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña</title>
    </head>
    <body style="width: 100%; max-width: 650px; margin: 0 auto;">

    <div style="width: 100%; max-width: 650px; margin: 0 auto; text-align: center; padding: 0 0 30px;">
        <h1 style="font-family: 'PT Sans', sans-serif;">Restaura tu contraseña</h1>
        <p style="font-family: 'PT Sans', sans-serif;">Hola, ingresando al siguiente link continuas el proceso de restaurar tu contraseña, si no fuiste tú ignora este mensaje</p>
        <a style="color: #e30613; font-family: 'PT Sans', sans-serif;" target="_blank" href='${process.env.URL_FRONT}/auth/new-password/${code}'>Restaurar contraseña</a>
    </div>

    </body>
    </html>
    `;
};

export const templateChagePasswordUser = (user: string, password: string) => {
  return `
    <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usuario</title>
</head>
<body style="width: 100%; max-width: 650px; margin: 0 auto;">
  <div style="width: 100%; max-width: 650px; margin: 0 auto; text-align: center; padding: 0 0 30px;">
    <h1 style="font-family: 'PT Sans', sans-serif;">Nueva contraseña</h1>
    <p style="font-family: 'PT Sans', sans-serif;">usuario: ${user}</p>
    <p style="font-family: 'PT Sans', sans-serif;">contraseña: ${password}</p>
  </div>
</body>
</html>

    `;
};
