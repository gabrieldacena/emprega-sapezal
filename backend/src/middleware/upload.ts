import multer from 'multer';
import { AppError } from '../utils/response';

// Configuração básica do Multer (armazenamento em memória para enviar p/ Supabase)
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError('Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.', 400));
        }
    },
});
