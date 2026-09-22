import multer from "multer";
import path from "path";
import fs from "fs";

// Garantiza que existan las carpetas donde se guardan las imágenes
const dirUsuarios = 'public/img/usuarios';
if (!fs.existsSync(dirUsuarios)) {
  fs.mkdirSync(dirUsuarios, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Si viene del endpoint de usuarios guarda en /usuarios, si no en /img
    const destino = req.baseUrl.includes('usuarios') ? 'public/img/usuarios' : 'public/img';
    cb(null, destino);
  },
  filename: function (req, file, cb) {
    // Agrega timestamp para evitar sobreescritura de nombres iguales
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// 1. Exportación nombrada para no romper server.js ni routerImage.js
export function multer_function(campo = 'miArchivo') {
  return upload.single(campo);
}

// 2. Exportación por defecto
export default upload;