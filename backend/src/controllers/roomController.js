import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// Ambil seluruh kamar (28 kamar 4 lantai) beserta status pembayaran di periode tertentu
export const getRooms = async (req, res, next) => {
  try {
    const { period_id } = req.query;

    if (!isSupabaseConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Mode fallback: konfigurasi Supabase diperlukan untuk data live.',
        data: { rooms: [], payments: [] }
      });
    }

    // 1. Fetch data kamar
    const { data: rooms, error: roomErr } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .order('floor_number', { ascending: true })
      .order('room_number', { ascending: true });

    if (roomErr) throw roomErr;

    // 2. Fetch payments untuk periode bersangkutan jika period_id disertakan
    let payments = [];
    if (period_id) {
      const { data: payData, error: payErr } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('period_id', period_id);
      if (payErr) throw payErr;
      payments = (payData || []).map((p) => ({
        ...p,
        status: p.payment_status || p.status || (p.is_paid ? 'paid' : 'unpaid')
      }));
    }

    res.status(200).json({
      success: true,
      data: { rooms, payments }
    });
  } catch (error) {
    next(error);
  }
};

function normalizePhoneNumber(input) {
  if (!input) return null;
  let str = String(input).trim();
  str = str.replace(/(?:^|\D)\+?62/g, '0');
  let digits = str.replace(/\D/g, '');
  if (digits.startsWith('62') && digits.length >= 3) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('8') && digits.length >= 2) {
    digits = '0' + digits;
  }
  return digits || null;
}

// Update data penghuni kamar (Tenant Edit Modal)
export const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenant_name, phone_number, is_occupied } = req.body;
    const cleanPhone = normalizePhoneNumber(phone_number);

    if (!isSupabaseConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Mock tenant updated',
        data: { ...req.body, phone_number: cleanPhone }
      });
    }

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .update({
        tenant_name: tenant_name?.trim() || null,
        phone_number: cleanPhone,
        is_occupied: is_occupied !== undefined ? is_occupied : Boolean(tenant_name?.trim())
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
