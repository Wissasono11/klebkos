import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// Ambil riwayat pengeluaran kas berdasarkan periode
export const getExpenses = async (req, res, next) => {
  try {
    const { period_id } = req.query;

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, data: [] });
    }

    let query = supabaseAdmin
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (period_id) {
      query = query.eq('period_id', period_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Tambah catatan pengeluaran baru (Khusus Bendahara)
export const createExpense = async (req, res, next) => {
  try {
    const { period_id, title, category = 'Operasional', amount, expense_date } = req.body;

    if (!period_id || !title || amount === undefined) {
      return res.status(400).json({ success: false, error: 'period_id, title, dan amount wajib diisi.' });
    }

    if (!isSupabaseConfigured) {
      return res.status(201).json({ success: true, message: 'Mock expense created', data: req.body });
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        period_id,
        title: title.trim(),
        category,
        amount: Number(amount),
        expense_date: expense_date || new Date().toISOString().split('T')[0],
        created_by: (req.user?.id && req.user.id.length === 36) ? req.user.id : null
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Update catatan pengeluaran
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, amount, expense_date, notes } = req.body;

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock expense updated', data: req.body });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) updates.amount = Number(amount);
    if (expense_date !== undefined) updates.expense_date = expense_date;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Hapus catatan pengeluaran
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock expense deleted' });
    }

    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Catatan pengeluaran berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

