import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Unggah berkas bukti pembayaran transfer ke Supabase Storage (Bucket: payment-proofs)
 * @param {File} file
 * @param {string} roomId
 * @returns {Promise<string>} URL publik berkas struk
 */
export async function uploadPaymentProof(file, roomId = 'room') {
  if (!file) throw new Error('File bukti transfer wajib disertakan.');

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase belum terkonfigurasi, menggunakan fallback URL lokal.');
    return URL.createObjectURL(file);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `receipts/${roomId}_${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Gagal upload ke Supabase Storage:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export default supabase;
