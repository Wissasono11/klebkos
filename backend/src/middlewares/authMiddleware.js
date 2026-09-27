import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const isProductionEnvironment = () => {
  return process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
};

// Verifikasi Supabase Bearer JWT Token
export const requireAuth = async (req, res, next) => {
  const isProd = isProductionEnvironment();

  if (!isSupabaseConfigured) {
    if (!isProd) {
      req.user = { id: 'mock-user', email: 'dev@kaskos.local', role: 'bendahara' };
      return next();
    }
    return res.status(503).json({ success: false, error: 'Layanan basis data tidak tersedia.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (!isProd) {
      req.user = { id: 'dev-bendahara', email: 'bendahara@kaskos.id', role: 'bendahara' };
      return next();
    }
    return res.status(401).json({ success: false, error: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  // Dukungan sesi demo bendahara bawaan aplikasi
  if (token === 'demo-bendahara-token' || token === 'mock-token') {
    req.user = { id: 'dev-bendahara', email: 'bendahara@kaskos.id', role: 'bendahara' };
    return next();
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Sesi login tidak valid atau telah kedaluwarsa.' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Autentikasi gagal.' });
  }
};

// Khusus endpoint mutasi yang hanya diizinkan untuk Bendahara
export const requireBendahara = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user?.role === 'bendahara') {
      return next();
    }

    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile || profile.role !== 'bendahara') {
        return res.status(403).json({ success: false, error: 'Akses terlarang: Hanya Bendahara yang diizinkan.' });
      }
      next();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Gagal memverifikasi hak akses pengguna.' });
    }
  });
};
