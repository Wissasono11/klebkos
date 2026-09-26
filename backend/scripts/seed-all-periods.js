import { supabaseAdmin, isSupabaseConfigured } from '../src/config/supabase.js';

const PERIODS_TO_SEED = [
  { month_number: 7, year_number: 2026, period_name: 'Juli 2026', monthly_fee: 50000, starting_balance: 0, is_closed: true, deadline_date: '2026-07-19' },
  { month_number: 8, year_number: 2026, period_name: 'Agustus 2026', monthly_fee: 50000, starting_balance: 1350000, is_closed: true, deadline_date: '2026-08-19' },
  { month_number: 9, year_number: 2026, period_name: 'September 2026', monthly_fee: 50000, starting_balance: 1500000, is_closed: false, deadline_date: '2026-09-19' },
  { month_number: 10, year_number: 2026, period_name: 'Oktober 2026', monthly_fee: 50000, starting_balance: 0, is_closed: false, deadline_date: '2026-10-19' },
  { month_number: 11, year_number: 2026, period_name: 'November 2026', monthly_fee: 50000, starting_balance: 0, is_closed: false, deadline_date: '2026-11-19' },
  { month_number: 12, year_number: 2026, period_name: 'Desember 2026', monthly_fee: 50000, starting_balance: 0, is_closed: false, deadline_date: '2026-12-19' },
];

async function seedAllPeriods() {
  console.log('📅 Memulai penyiapan data seluruh periode bulan kas kos...');

  if (!isSupabaseConfigured) {
    console.error('❌ Supabase belum terkonfigurasi.');
    process.exit(1);
  }

  try {
    // 1. Ambil seluruh kamar yang ada di database
    const { data: rooms, error: rErr } = await supabaseAdmin
      .from('rooms')
      .select('id, room_number')
      .order('floor_number')
      .order('room_number');

    if (rErr) throw rErr;
    if (!rooms || rooms.length === 0) {
      console.error('❌ Belum ada kamar di database. Jalankan seed-rooms.js terlebih dahulu.');
      process.exit(1);
    }

    console.log(`ℹ️ Ditemukan ${rooms.length} kamar master.`);

    // 2. Loop dan pastikan setiap periode tersedia
    for (const p of PERIODS_TO_SEED) {
      let periodId;
      const { data: existing } = await supabaseAdmin
        .from('monthly_periods')
        .select('*')
        .eq('month_number', p.month_number)
        .eq('year_number', p.year_number)
        .maybeSingle();

      if (existing) {
        periodId = existing.id;
        console.log(`✓ Periode ${p.period_name} sudah ada.`);
      } else {
        const { data: created, error: pErr } = await supabaseAdmin
          .from('monthly_periods')
          .insert(p)
          .select()
          .single();

        if (pErr) throw pErr;
        periodId = created.id;
        console.log(`+ Berhasil membuat periode: ${p.period_name}`);
      }

      // Pastikan ada records payments untuk setiap kamar di periode ini
      const paymentRecords = rooms.map((r) => ({
        period_id: periodId,
        room_id: r.id,
        is_paid: false,
        payment_status: 'unpaid',
        paid_amount: p.monthly_fee,
        advance_months: 1
      }));

      const { error: payErr } = await supabaseAdmin
        .from('payments')
        .upsert(paymentRecords, { onConflict: 'period_id,room_id' });

      if (payErr) {
        console.warn(`⚠️ Warning saat upsert payments ${p.period_name}:`, payErr.message);
      }
    }

    console.log('\n✨ Berhasil menyiapkan seluruh opsi periode bulan (Juli - Desember 2026)!');
  } catch (err) {
    console.error('❌ Error seeding periods:', err.message);
  }
}

seedAllPeriods();
