import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// Verifikasi Supabase Bearer JWT Token
export const requireAuth = async (req, res, next) => {
  if (!isSupabaseConfigured) {
    // Mode demo/dev tanpa supabase configured: passthrough
    req.user = { id: 'mock-user', email: 'dev@kaskos.local', role: 'bendahara' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev mode, allow default bendahara
    if (process.env.NODE_ENV !== 'production') {
      req.user = { id: 'dev-bendahara', email: 'bendahara@kaskos.id', role: 'bendahara' };
      return next();
    }
    return res.status(401).json({ success: false, error: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  // Dev bypass token
  if (token === 'demo-bendahara-token' || token === 'mock-token') {
    req.user = { id: 'dev-bendahara', email: 'bendahara@kaskos.id', role: 'bendahara' };
    return next();
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      // In dev fallback
      if (process.env.NODE_ENV !== 'production') {
        req.user = { id: 'dev-bendahara', email: 'bendahara@kaskos.id', role: 'bendahara' };
        return next();
      }
      return res.status(401).json({ success: false, error: 'Sesi login tidak valid atau telah kedaluwarsa.' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = { id: 'dev-bendahara', email: 'bendahara@kaskos.id', role: 'bendahara' };
      return next();
    }
    res.status(401).json({ success: false, error: 'Autentikasi gagal: ' + err.message });
  }
};

// Khusus endpoint mutasi yang hanya diizinkan untuk Bendahara
export const requireBendahara = async (req, res, next) => {
  if (!isSupabaseConfigured) return next();

  await requireAuth(req, res, async () => {
    if (req.user?.role === 'bendahara') {
      return next();
    }

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (!profile || profile.role !== 'bendahara') {
        if (process.env.NODE_ENV !== 'production') {
          return next();
        }
        return res.status(403).json({ success: false, error: 'Akses terlarang: Hanya Bendahara yang diizinkan.' });
      }
      next();
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        return next();
      }
      res.status(500).json({ success: false, error: 'Gagal memverifikasi hak akses pengguna.' });
    }
  });
};
