import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let DATA_FILE = '';
try {
  if (typeof import.meta?.url === 'string' && import.meta.url.startsWith('file:')) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    DATA_FILE = path.resolve(__dirname, '../../data/incomes.json');
  }
} catch (e) {}

let inMemoryIncomes = [];

export function readIncomes() {
  if (!DATA_FILE) return inMemoryIncomes;
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return inMemoryIncomes;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data) || inMemoryIncomes;
  } catch (err) {
    return inMemoryIncomes;
  }
}

export function writeIncomes(incomes) {
  inMemoryIncomes = incomes;
  if (!DATA_FILE) return;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(incomes, null, 2), 'utf8');
  } catch (err) {
    // Cloudflare Workers has no persistent local disk
  }
}

// GET /api/v1/incomes?period_id=...
export const getIncomes = async (req, res, next) => {
  try {
    const { period_id } = req.query;

    // Prioritas 1: Ambil langsung dari Supabase Database (Tabel 'incomes')
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('incomes')
          .select('*')
          .order('income_date', { ascending: false });

        if (period_id) {
          query = query.eq('period_id', period_id);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return res.status(200).json({ success: true, data });
        }

        if (error && error.code !== 'PGRST205') {
          console.warn('⚠️ Supabase getIncomes error:', error.message);
        }
      } catch (dbErr) {
        console.warn('⚠️ Gagal query database Supabase incomes, fallback lokal:', dbErr.message);
      }
    }

    // Fallback: Penyimpanan lokal JSON / memory
    let list = readIncomes();

    if (period_id) {
      list = list.filter((i) => i.period_id === period_id);
    }

    list.sort((a, b) => new Date(b.income_date) - new Date(a.income_date));

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/incomes
export const createIncome = async (req, res, next) => {
  try {
    const { period_id, title, category = 'Iuran Manual', amount, income_date, notes } = req.body;

    if (!period_id || !title || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'period_id, title, dan amount wajib diisi.'
      });
    }

    // Prioritas 1: Simpan ke Supabase Database (Tabel 'incomes')
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('incomes')
          .insert({
            period_id,
            title: title.trim(),
            category: category || 'Iuran Manual',
            amount: Number(amount) || 0,
            income_date: income_date || new Date().toISOString().split('T')[0],
            notes: notes || '',
            created_by: (req.user?.id && req.user.id.length === 36) ? req.user.id : null
          })
          .select()
          .single();

        if (!error && data) {
          // Sinkronkan ke memory/lokal
          const list = readIncomes();
          list.unshift(data);
          writeIncomes(list);

          return res.status(201).json({ success: true, data });
        }

        if (error && error.code !== 'PGRST205') {
          console.warn('⚠️ Supabase createIncome error:', error.message);
        }
      } catch (dbErr) {
        console.warn('⚠️ Gagal insert database Supabase incomes, fallback lokal:', dbErr.message);
      }
    }

    // Fallback: Simpan ke JSON / memory lokal
    const list = readIncomes();
    const newIncome = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      period_id,
      title: title.trim(),
      category: category || 'Iuran Manual',
      amount: Number(amount) || 0,
      income_date: income_date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    list.unshift(newIncome);
    writeIncomes(list);

    res.status(201).json({ success: true, data: newIncome });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/incomes/:id
export const updateIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, amount, income_date, notes } = req.body;

    // Prioritas 1: Update di Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const updates = {};
        if (title !== undefined) updates.title = title.trim();
        if (category !== undefined) updates.category = category;
        if (amount !== undefined) updates.amount = Number(amount);
        if (income_date !== undefined) updates.income_date = income_date;
        if (notes !== undefined) updates.notes = notes;

        const { data, error } = await supabaseAdmin
          .from('incomes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return res.status(200).json({ success: true, data });
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase updateIncome db error:', dbErr.message);
      }
    }

    // Fallback: Update di memory / JSON lokal
    const list = readIncomes();
    const index = list.findIndex((i) => i.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Data pemasukan tidak ditemukan.' });
    }

    const current = list[index];
    list[index] = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      category: category !== undefined ? category : current.category,
      amount: amount !== undefined ? Number(amount) : current.amount,
      income_date: income_date !== undefined ? income_date : current.income_date,
      notes: notes !== undefined ? notes : current.notes,
      updated_at: new Date().toISOString()
    };

    writeIncomes(list);
    res.status(200).json({ success: true, data: list[index] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/incomes/:id
export const deleteIncome = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prioritas 1: Hapus dari Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin
          .from('incomes')
          .delete()
          .eq('id', id);

        if (!error) {
          // Sinkronkan penghapusan di memory lokal
          let list = readIncomes();
          list = list.filter((i) => i.id !== id);
          writeIncomes(list);

          return res.status(200).json({ success: true, message: 'Data pemasukan berhasil dihapus dari database.' });
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase deleteIncome db error:', dbErr.message);
      }
    }

    // Fallback: Hapus dari memory / JSON lokal
    let list = readIncomes();
    const exists = list.some((i) => i.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'Data pemasukan tidak ditemukan.' });
    }

    list = list.filter((i) => i.id !== id);
    writeIncomes(list);

    res.status(200).json({ success: true, message: 'Data pemasukan berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};
