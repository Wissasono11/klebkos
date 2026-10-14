import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Muat .env sekali — server.js sudah memanggil dotenv.config() untuk Node lokal,
// tapi di Cloudflare Workers env var datang dari wrangler secrets.
try { dotenv.config(); } catch (_) {}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

if (!isSupabaseConfigured) {
  console.warn('⚠️ [Supabase Config]: SUPABASE_URL / KEYS belum diisi di backend/.env. API berjalan dalam mode fallback/mock.');
}

// Client dengan service_role untuk mutasi aman backend (bypass RLS untuk alur advance payment & batch)
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

// ponytail: removed unused `supabase` (anon) export — every controller uses supabaseAdmin only
