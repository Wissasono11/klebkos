import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// Helper: Nama bulan dalam Bahasa Indonesia
const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Helper: Dapatkan atau buat otomatis periode masa depan untuk Advance Payment
async function getOrCreatePeriod(targetMonth, targetYear, fee = 50000) {
  const periodName = `${MONTH_NAMES[targetMonth]} ${targetYear}`;
  
  // Cek apakah sudah ada
  const { data: existing } = await supabaseAdmin
    .from('monthly_periods')
    .select('id')
    .eq('month_number', targetMonth)
    .eq('year_number', targetYear)
    .maybeSingle();

  if (existing) return existing.id;

  // Jika belum ada, buat periode baru
  const deadlineDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-19`;
  const { data: created, error } = await supabaseAdmin
    .from('monthly_periods')
    .insert({
      period_name: periodName,
      month_number: targetMonth,
      year_number: targetYear,
      monthly_fee: fee,
      deadline_date: deadlineDate,
      starting_balance: 0,
      is_closed: false
    })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

// 1. Toggle Pelunasan Standard (1 Bulan)
export const togglePayment = async (req, res, next) => {
  try {
    const { roomId, periodId, isPaid } = req.body;
    if (!roomId || !periodId) {
      return res.status(400).json({ success: false, error: 'roomId dan periodId wajib diisi.' });
    }

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock toggle payment success' });
    }

    const nextPaid = typeof isPaid === 'boolean' ? isPaid : true;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .upsert({
        period_id: periodId,
        room_id: roomId,
        is_paid: nextPaid,
        payment_status: nextPaid ? 'paid' : 'unpaid',
        paid_amount: 50000,
        advance_months: 1,
        paid_at: nextPaid ? new Date().toISOString() : null
      }, { onConflict: 'period_id,room_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 2. Multi-Month Advance Payment (Fitur Utama v5)
export const processMultiMonthPayment = async (req, res, next) => {
  try {
    const { roomId, currentPeriodId, numberOfMonths = 2, paidAmount } = req.body;
    const monthsCount = Math.max(1, Math.min(Number(numberOfMonths), 12));
    const totalFee = paidAmount || (monthsCount * 50000);

    if (!roomId || !currentPeriodId) {
      return res.status(400).json({ success: false, error: 'roomId dan currentPeriodId wajib disertakan.' });
    }

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: `Mock advance payment ${monthsCount} bulan tersimpan` });
    }

    // Ambil info periode berjalan
    const { data: currPeriod, error: periodErr } = await supabaseAdmin
      .from('monthly_periods')
      .select('month_number, year_number, period_name, monthly_fee')
      .eq('id', currentPeriodId)
      .single();

    if (periodErr || !currPeriod) throw new Error('Periode berjalan tidak ditemukan.');

    const note = `Lunas ${monthsCount} bulan sekaligus (Total Rp ${totalFee.toLocaleString('id-ID')})`;

    // Step A: Update pembayaran periode berjalan
    const { error: currPayErr } = await supabaseAdmin
      .from('payments')
      .upsert({
        period_id: currentPeriodId,
        room_id: roomId,
        is_paid: true,
        payment_status: 'paid',
        paid_amount: totalFee,
        advance_months: monthsCount,
        notes: note,
        paid_at: new Date().toISOString()
      }, { onConflict: 'period_id,room_id' });

    if (currPayErr) throw currPayErr;

    // Step B: Alokasi otomatis untuk bulan-bulan berikutnya jika >= 2 bulan
    let currentMonth = currPeriod.month_number;
    let currentYear = currPeriod.year_number;

    for (let i = 1; i < monthsCount; i++) {
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }

      const nextPeriodId = await getOrCreatePeriod(currentMonth, currentYear, currPeriod.monthly_fee);

      await supabaseAdmin
        .from('payments')
        .upsert({
          period_id: nextPeriodId,
          room_id: roomId,
          is_paid: true,
          payment_status: 'paid',
          paid_amount: 50000,
          advance_months: 1,
          notes: `Lunas otomatis dari advance payment periode ${currPeriod.period_name}`,
          paid_at: new Date().toISOString()
        }, { onConflict: 'period_id,room_id' });
    }

    res.status(200).json({
      success: true,
      message: `Berhasil memproses pelunasan ${monthsCount} bulan untuk kamar terkait.`
    });
  } catch (error) {
    next(error);
  }
};

// 3. Portal Penghuni: Unggah Bukti Transfer
export const submitProof = async (req, res, next) => {
  try {
    const { roomId, periodId, numberOfMonths = 1, proofUrl, paymentMethod = 'Transfer Bank', notes = '' } = req.body;

    if (!roomId || !periodId || !proofUrl) {
      return res.status(400).json({ success: false, error: 'roomId, periodId, dan proofUrl wajib diisi.' });
    }

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock bukti transfer diterima' });
    }

    const months = Number(numberOfMonths) || 1;
    const amount = months * 50000;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .upsert({
        period_id: periodId,
        room_id: roomId,
        is_paid: false,
        payment_status: 'pending_verification',
        paid_amount: amount,
        advance_months: months,
        proof_url: proofUrl,
        payment_method: paymentMethod,
        notes: notes || `Pengajuan verifikasi ${months} bulan`,
        paid_at: new Date().toISOString()
      }, { onConflict: 'period_id,room_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 4. Antrean Verifikasi (Khusus Bendahara)
export const getVerificationQueue = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        rooms:room_id (
          id,
          room_number,
          floor_number,
          tenant_name,
          phone_number
        ),
        monthly_periods:period_id (
          id,
          period_name
        )
      `)
      .eq('payment_status', 'pending_verification')
      .order('paid_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 5. Persetujuan Bukti Transfer (Approve)
export const approveProof = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock approval success' });
    }

    // Ambil data transaksi saat ini
    const { data: payment, error: fetchErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !payment) throw new Error('Data pembayaran tidak ditemukan.');

    // Update status transaksi ini menjadi lunas
    const { error: updateErr } = await supabaseAdmin
      .from('payments')
      .update({
        is_paid: true,
        payment_status: 'paid',
        verified_at: new Date().toISOString(),
        verified_by: (req.user?.id && req.user.id.length === 36) ? req.user.id : null
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Jika pembayaran mencakup multi-bulan (advance_months >= 2), alokasikan otomatis ke bulan depan
    if (payment.advance_months && payment.advance_months >= 2) {
      await processMultiMonthPayment(
        {
          body: {
            roomId: payment.room_id,
            currentPeriodId: payment.period_id,
            numberOfMonths: payment.advance_months,
            paidAmount: payment.paid_amount
          }
        },
        { status: () => ({ json: () => {} }) },
        () => {}
      );
    }

    res.status(200).json({ success: true, message: 'Bukti pembayaran berhasil disetujui.' });
  } catch (error) {
    next(error);
  }
};

// 6. Penolakan Bukti Transfer (Reject)
export const rejectProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isSupabaseConfigured) {
      return res.status(200).json({ success: true, message: 'Mock reject success' });
    }

    const { error } = await supabaseAdmin
      .from('payments')
      .update({
        is_paid: false,
        payment_status: 'rejected',
        rejection_reason: reason || 'Bukti transfer tidak valid atau tidak terbaca.',
        verified_at: new Date().toISOString(),
        verified_by: (req.user?.id && req.user.id.length === 36) ? req.user.id : null
      })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Bukti pembayaran telah ditolak.' });
  } catch (error) {
    next(error);
  }
};
