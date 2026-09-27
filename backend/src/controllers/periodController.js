import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { readIncomes, writeIncomes } from './incomeController.js';

// Helper: Hitung kalkulasi saldo berjalan (dynamic carryover) seluruh periode secara kronologis
async function getPeriodsWithCarryover() {
  // 1. Ambil seluruh periode urut kronologis (terlama ke terbaru)
  const { data: rawPeriods, error: pErr } = await supabaseAdmin
    .from('monthly_periods')
    .select('*')
    .order('year_number', { ascending: true })
    .order('month_number', { ascending: true });

  if (pErr) throw pErr;
  if (!rawPeriods || rawPeriods.length === 0) return [];

  // 2. Ambil seluruh pembayaran yang sudah lunas
  const { data: allPayments } = await supabaseAdmin
    .from('payments')
    .select('period_id, paid_amount, is_paid')
    .eq('is_paid', true);

  // 3. Ambil seluruh pengeluaran
  const { data: allExpenses } = await supabaseAdmin
    .from('expenses')
    .select('period_id, amount');

  // 4. Ambil seluruh pemasukan manual dari Supabase Database (Tabel 'incomes')
  let allManualIncomes = [];
  try {
    const { data: dbIncomes, error: incErr } = await supabaseAdmin
      .from('incomes')
      .select('period_id, amount');
    if (!incErr && Array.isArray(dbIncomes)) {
      allManualIncomes = dbIncomes;
    } else {
      allManualIncomes = readIncomes();
    }
  } catch (_) {
    allManualIncomes = readIncomes();
  }

  // 5. Hitung carryover akumulatif dari bulan ke bulan
  let runningBalance = Number(rawPeriods[0]?.starting_balance) || 0;
  const computedPeriods = [];

  for (let i = 0; i < rawPeriods.length; i++) {
    const period = rawPeriods[i];
    const periodPayments = (allPayments || []).filter((p) => p.period_id === period.id);
    const roomIncome = periodPayments.reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0);

    const periodManualIncomes = (allManualIncomes || []).filter((inc) => inc.period_id === period.id);
    const manualIncome = periodManualIncomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
    const totalIncome = roomIncome + manualIncome;

    const periodExpenses = (allExpenses || []).filter((e) => e.period_id === period.id);
    const totalExpense = periodExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Bulan pertama menggunakan starting_balance awal (default 0),
    // bulan-bulan berikutnya otomatis mengambil saldo akhir bulan sebelumnya (runningBalance)
    const startingBalance = i === 0 ? (Number(period.starting_balance) || 0) : runningBalance;
    const currentBalance = startingBalance + totalIncome - totalExpense;

    // Sisa kas periode ini menjadi saldo awal periode berikutnya
    runningBalance = currentBalance;

    computedPeriods.push({
      ...period,
      starting_balance: startingBalance,
      room_income: roomIncome,
      manual_income: manualIncome,
      total_income: totalIncome,
      total_expenses: totalExpense,
      current_balance: currentBalance,
      paid_rooms_count: periodPayments.length
    });
  }

  // Sinkronisasi otomatis ke database di background agar tabel tetap konsisten
  Promise.all(
    computedPeriods.map((p) =>
      supabaseAdmin
        .from('monthly_periods')
        .update({ starting_balance: p.starting_balance })
        .eq('id', p.id)
    )
  ).catch(() => {});

  return computedPeriods;
}

// Ambil seluruh daftar periode kas bulanan dengan Saldo Awal Terintegrasi
export const getPeriods = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, data: [] });
    }

    const computedPeriods = await getPeriodsWithCarryover();
    // Return urut descending untuk dropdown switcher (terbaru ke terlama)
    const displayPeriods = [...computedPeriods].reverse();

    res.status(200).json({ success: true, data: displayPeriods });
  } catch (error) {
    next(error);
  }
};

// Ambil ringkasan finansial (KPI Bento Grid) untuk satu periode tertentu
export const getPeriodSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(200).json({
        success: true,
        data: {
          period: null,
          starting_balance: 0,
          total_income: 0,
          total_expenses: 0,
          current_balance: 0,
          paid_rooms_count: 0,
          total_rooms_count: 28
        }
      });
    }

    const computedPeriods = await getPeriodsWithCarryover();
    const period = computedPeriods.find((p) => p.id === id);

    if (!period) {
      return res.status(404).json({ success: false, error: 'Periode tidak ditemukan.' });
    }

    const { count: pendingCount } = await supabaseAdmin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('period_id', id)
      .eq('payment_status', 'pending_verification');

    res.status(200).json({
      success: true,
      data: {
        period,
        starting_balance: period.starting_balance,
        total_income: period.total_income,
        total_expenses: period.total_expenses,
        current_balance: period.current_balance,
        paid_rooms_count: period.paid_rooms_count,
        pending_count: pendingCount || 0,
        total_rooms_count: 28
      }
    });
  } catch (error) {
    next(error);
  }
};

const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Buat periode bulan baru & inisialisasi tagihan seluruh kamar
export const createPeriod = async (req, res, next) => {
  try {
    const { month_number, year_number, monthly_fee = 50000, starting_balance = 0, deadline_date } = req.body;

    if (!month_number || !year_number) {
      return res.status(400).json({ success: false, error: 'month_number dan year_number wajib diisi.' });
    }

    const monthNum = parseInt(month_number, 10);
    const yearNum = parseInt(year_number, 10);
    const periodName = `${MONTH_NAMES[monthNum]} ${yearNum}`;
    const deadline = deadline_date || `${yearNum}-${String(monthNum).padStart(2, '0')}-19`;

    if (!isSupabaseConfigured) {
      return res.status(201).json({
        success: true,
        data: {
          id: `p-${yearNum}-${String(monthNum).padStart(2, '0')}`,
          period_name: periodName,
          month_number: monthNum,
          year_number: yearNum,
          monthly_fee,
          starting_balance,
          deadline_date: deadline,
          is_closed: false
        }
      });
    }

    // 1. Cek apakah sudah ada
    const { data: existing } = await supabaseAdmin
      .from('monthly_periods')
      .select('*')
      .eq('month_number', monthNum)
      .eq('year_number', yearNum)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({ success: true, message: 'Periode sudah terdaftar', data: existing });
    }

    // 2. Buat periode baru
    const { data: newPeriod, error: pErr } = await supabaseAdmin
      .from('monthly_periods')
      .insert({
        period_name: periodName,
        month_number: monthNum,
        year_number: yearNum,
        monthly_fee: Number(monthly_fee) || 50000,
        starting_balance: Number(starting_balance) || 0,
        deadline_date: deadline,
        is_closed: false
      })
      .select()
      .single();

    if (pErr) throw pErr;

    // 3. Ambil seluruh kamar kos untuk di-generate tagihan payments default
    const { data: rooms } = await supabaseAdmin
      .from('rooms')
      .select('id');

    if (rooms && rooms.length > 0) {
      const initialPayments = rooms.map((r) => ({
        period_id: newPeriod.id,
        room_id: r.id,
        is_paid: false,
        payment_status: 'unpaid',
        paid_amount: Number(monthly_fee) || 50000,
        advance_months: 1
      }));

      await supabaseAdmin
        .from('payments')
        .upsert(initialPayments, { onConflict: 'period_id,room_id' });
    }

    res.status(201).json({ success: true, data: newPeriod });
  } catch (error) {
    next(error);
  }
};

// Hapus periode buku kas (Hanya jika dibutuhkan)
export const deletePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock period deleted' });
    }

    // 1. Cek keberadaan periode
    const { data: period, error: findErr } = await supabaseAdmin
      .from('monthly_periods')
      .select('id, period_name')
      .eq('id', id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!period) {
      return res.status(404).json({ success: false, error: 'Periode tidak ditemukan.' });
    }

    // 2. Hapus data payments, expenses, dan manual incomes terkait
    await supabaseAdmin.from('payments').delete().eq('period_id', id);
    await supabaseAdmin.from('expenses').delete().eq('period_id', id);

    let allManualIncomes = readIncomes();
    if (allManualIncomes.some((i) => i.period_id === id)) {
      writeIncomes(allManualIncomes.filter((i) => i.period_id !== id));
    }

    // 3. Hapus record periode
    const { error: delErr } = await supabaseAdmin
      .from('monthly_periods')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    res.status(200).json({
      success: true,
      message: `Periode "${period.period_name}" berhasil dihapus.`
    });
  } catch (error) {
    next(error);
  }
};


