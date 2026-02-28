import { Request, Response, NextFunction } from 'express';
import { supabase, STORAGE_BUCKET } from '../../config/storage';
import { sendSuccess, AppError } from '../../utils/response';
import crypto from 'crypto';

export class UploadController {
    /** Faz o upload de uma imagem para o Supabase Storage */
    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!supabase) {
                throw new AppError('Storage não configurado. Adicione as chaves do Supabase no .env', 500);
            }
            const file = (req as any).file;
            if (!file) {
                throw new AppError('Nenhum arquivo enviado.', 400);
            }

            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExt}`;
            const filePath = `images/${fileName}`;

            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                console.error('[Upload] Erro Supabase:', error.message);
                throw new AppError('Erro ao enviar arquivo para o storage.', 500);
            }

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            sendSuccess(res, { url: publicUrl, path: data.path }, 201);
        } catch (error) {
            next(error);
        }
    }
}

export const uploadController = new UploadController();
