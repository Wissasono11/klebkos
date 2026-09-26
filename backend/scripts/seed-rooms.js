import { supabaseAdmin, isSupabaseConfigured } from '../src/config/supabase.js';

const MASTER_ROOMS = [
  // Lantai 1
  { floor_number: 1, room_number: '1.1', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 1, room_number: '1.2', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 1, room_number: '1.3', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 1, room_number: '1.4', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 1, room_number: '1.5', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 1, room_number: '1.6', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 1, room_number: '1.7', tenant_name: '', phone_number: '', is_occupied: false },

  // Lantai 2
  { floor_number: 2, room_number: '2.1', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 2, room_number: '2.2', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 2, room_number: '2.3', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 2, room_number: '2.4', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 2, room_number: '2.5', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 2, room_number: '2.6', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 2, room_number: '2.7', tenant_name: '', phone_number: '', is_occupied: false },

  // Lantai 3
  { floor_number: 3, room_number: '3.1', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 3, room_number: '3.2', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 3, room_number: '3.3', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 3, room_number: '3.4', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 3, room_number: '3.5', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 3, room_number: '3.6', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 3, room_number: '3.7', tenant_name: '', phone_number: '', is_occupied: false },

  // Lantai 4
  { floor_number: 4, room_number: '4.1', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 4, room_number: '4.2', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 4, room_number: '4.3', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 4, room_number: '4.4', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 4, room_number: '4.5', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 4, room_number: '4.6', tenant_name: '', phone_number: '', is_occupied: false },
  { floor_number: 4, room_number: '4.7', tenant_name: '', phone_number: '', is_occupied: false }
];

async function seedRooms() {
  console.log('🌱 Menambahkan master data kamar kos ke Supabase...');

  if (!isSupabaseConfigured) {
    console.error('❌ Supabase belum terkonfigurasi.');
    process.exit(1);
  }

  try {
    // 1. Masukkan master rooms
    const { data: insertedRooms, error: roomErr } = await supabaseAdmin
      .from('rooms')
      .upsert(MASTER_ROOMS, { onConflict: 'room_number' })
      .select();

    if (roomErr) throw roomErr;
    console.log(`✅ Berhasil menambahkan ${insertedRooms.length} kamar kos (Lantai 1 - 4).`);

    // 2. Buat otomatis periode aktif bulan ini jika belum ada
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const periodName = `${monthNames[month]} ${year}`;

    let periodId;
    const { data: existingPeriod } = await supabaseAdmin
      .from('monthly_periods')
      .select('id')
      .eq('month_number', month)
      .eq('year_number', year)
      .maybeSingle();

    if (existingPeriod) {
      periodId = existingPeriod.id;
    } else {
      const { data: newPeriod, error: pErr } = await supabaseAdmin
        .from('monthly_periods')
        .insert({
          period_name: periodName,
          month_number: month,
          year_number: year,
          deadline_date: `${year}-${String(month).padStart(2, '0')}-19`,
          monthly_fee: 50000,
          starting_balance: 0,
          is_closed: false
        })
        .select()
        .single();

      if (pErr) throw pErr;
      periodId = newPeriod.id;
      console.log(`✅ Periode ${periodName} berhasil dibuat.`);
    }

    // 3. Buat record pembayaran unpaid default untuk seluruh kamar di periode aktif
    const paymentsToInsert = insertedRooms.map((r) => ({
      period_id: periodId,
      room_id: r.id,
      is_paid: false,
      payment_status: 'unpaid',
      paid_amount: 50000,
      advance_months: 1
    }));

    const { error: payErr } = await supabaseAdmin
      .from('payments')
      .upsert(paymentsToInsert, { onConflict: 'period_id,room_id' });

    if (payErr) throw payErr;
    console.log(`✅ Record tagihan pembayaran awal untuk seluruh kamar berhasil disiapkan.`);
    console.log('\n✨ Selesai! Silakan refresh browser Anda.');
  } catch (err) {
    console.error('❌ Gagal seed kamar:', err.message);
  }
}

seedRooms();
