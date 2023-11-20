// Filtro de extensiones de archivos excel
export const fileFilterExcel = (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
      return cb(new Error('Formato de excel invaliddo.'), false);
    }
    cb(null, true);
  };