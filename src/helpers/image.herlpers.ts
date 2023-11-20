// Renombrar imagenes
export const renameImage = (req, file, cb) => {
  const fileName = file.originalname;
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  cb(null, `${randomName}-${fileName}`);
};

// Filtro de extensiones
export const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Formato de imagen invaliddo.'), false);
  }
  cb(null, true);
};
