import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ [Storage] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes. Upload de imagens desativado.');
}

export const supabase = (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    })
    : null;

export const STORAGE_BUCKET = 'uploads';
