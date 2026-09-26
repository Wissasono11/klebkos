import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/incomes.json');

export function readIncomes() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Error reading incomes.json:', err.message);
    return [];
  }
}

export function writeIncomes(incomes) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(incomes, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing incomes.json:', err.message);
  }
}

// GET /api/v1/incomes?period_id=...
export const getIncomes = async (req, res, next) => {
  try {
    const { period_id } = req.query;
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
