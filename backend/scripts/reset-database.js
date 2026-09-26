import { supabaseAdmin, isSupabaseConfigured } from '../src/config/supabase.js';

async function resetDatabase() {
  console.log('🔄 Memulai pembersihan seluruh data di Supabase...');

  if (!isSupabaseConfigured) {
    console.error('❌ Supabase belum terkonfigurasi di backend/.env');
    process.exit(1);
  }

  try {
    // 1. Hapus catatan pengeluaran
    const { error: expErr } = await supabaseAdmin.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (expErr) throw expErr;
    console.log('✅ Data expenses berhasil dikosongkan.');

    // 2. Hapus transaksi & antrean pembayaran
    const { error: payErr } = await supabaseAdmin.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (payErr) throw payErr;
    console.log('✅ Data payments berhasil dikosongkan.');

    // 3. Hapus periode bulanan
    const { error: perErr } = await supabaseAdmin.from('monthly_periods').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (perErr) throw perErr;
    console.log('✅ Data monthly_periods berhasil dikosongkan.');

    // 4. Hapus data kamar kos
    const { error: roomErr } = await supabaseAdmin.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (roomErr) throw roomErr;
    console.log('✅ Data rooms berhasil dikosongkan.');

    // 5. Hapus profiles
    const { error: profErr } = await supabaseAdmin.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (profErr) throw profErr;
    console.log('✅ Data profiles berhasil dikosongkan.');

    // 6. Hapus berkas struk di storage
    try {
      const { data: files } = await supabaseAdmin.storage.from('payment-proofs').list('receipts');
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `receipts/${f.name}`);
        await supabaseAdmin.storage.from('payment-proofs').remove(filePaths);
        console.log(`✅ ${files.length} file struk di Storage berhasil dibersihkan.`);
      }
    } catch (storeErr) {
      // Abaikan jika folder kosong
    }

    console.log('\n🎉 Seluruh database telah bersih (0 records)! Anda siap memulai dari awal.');
  } catch (err) {
    console.error('❌ Gagal melakukan reset database:', err.message);
  }
}

resetDatabase();
