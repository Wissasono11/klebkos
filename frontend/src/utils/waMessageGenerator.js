import { formatRupiah, formatDate } from './formatters';

/**
 * Generate formatted WhatsApp group recap broadcast message
 */
export function generateGroupWARekap({ periodName, startingBalance, payments, rooms, expenses, incomes = [], deadlineDate }) {
  const paidRooms = [];
  const unpaidRooms = [];
  const pendingRooms = [];

  rooms.forEach(room => {
    if (!room.is_occupied) return;
    const payment = payments.find(p => p.room_id === room.id);
    if (payment?.is_paid) {
      const adv = payment.advance_months && payment.advance_months > 1 ? ` (${payment.advance_months} bln)` : '';
      paidRooms.push(`${room.room_number} - ${room.tenant_name}${adv}`);
    } else if (payment?.status === 'pending_verification') {
      pendingRooms.push(`${room.room_number} - ${room.tenant_name}`);
    } else {
      unpaidRooms.push(`${room.room_number} - ${room.tenant_name}`);
    }
  });

  const totalIuran = payments
    .filter(p => p.is_paid)
    .reduce((sum, p) => sum + (Number(p.paid_amount) || 50000), 0);

  const totalManualIncome = (incomes || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalIncome = totalIuran + totalManualIncome;
  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const currentBalance = (startingBalance || 0) + totalIncome - totalExpense;

  return `*📢 REKAP KAS KOS KLEBENGAN - ${periodName?.toUpperCase() || 'BULAN INI'} 📢*
━━━━━━━━━━━━━━━━━━━━━━
💰 *RINGKASAN KEUANGAN*
• Kas Bulan Lalu: ${formatRupiah(startingBalance)}
• Iuran Kamar Masuk: ${formatRupiah(totalIuran)} (${paidRooms.length}/${paidRooms.length + unpaidRooms.length + pendingRooms.length} Kamar)
${totalManualIncome > 0 ? `• Pemasukan Kas Manual: ${formatRupiah(totalManualIncome)}\n` : ''}• Total Pemasukan: ${formatRupiah(totalIncome)}
• Pengeluaran Operasional: ${formatRupiah(totalExpense)}
• *TOTAL KAS SAAT INI*: *${formatRupiah(currentBalance)}*
• Deadline: *${formatDate(deadlineDate) || '19 Setiap Bulan'}*

✅ *SUDAH LUNAS (${paidRooms.length} Kamar)*:
${paidRooms.length > 0 ? paidRooms.map(r => `• Kamar ${r}`).join('\n') : '• Belum ada'}

${pendingRooms.length > 0 ? `⏳ *MENUNGGU VERIFIKASI (${pendingRooms.length} Kamar)*:\n${pendingRooms.map(r => `• Kamar ${r}`).join('\n')}\n\n` : ''}❌ *BELUM BAYAR (${unpaidRooms.length} Kamar)*:
${unpaidRooms.length > 0 ? unpaidRooms.map(r => `• Kamar ${r}`).join('\n') : '• Semua telah lunas 🎉'}

━━━━━━━━━━━━━━━━━━━━━━
Nominal: *Rp 50.000 / bulan*
Transfer via BCA/BRI/Dana ke Rekening Bendahara.
Kirim bukti transfer ke WhatsApp Bendahara.
Terima kasih atas kerjasamanya!`;
}

/**
 * Generate personal tenant WhatsApp reminder message URL
 */
export function generateTenantWAReminder(room, periodName, amount = 50000) {
  const phone = room.phone_number?.replace(/\D/g, '') || '';
  const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

  const text = `Halo Mas *${room.tenant_name}* (Kamar ${room.room_number})!
Mengingatkan untuk iuran kas kos Klebengan periode *${periodName || 'Bulan Ini'}* sebesar *${formatRupiah(amount)}*.
Deadline pembayaran tanggal 19 setiap bulannya ya. Terima kasih!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate formatted WhatsApp message specifically for list of tenants who have paid
 */
export function generatePaidOnlyWARekap({ periodName, payments, rooms, deadlineDate }) {
  const paidRooms = [];
  let totalCollected = 0;

  rooms.forEach((room) => {
    if (!room.is_occupied) return;
    const payment = payments.find((p) => p.room_id === room.id);
    if (payment?.is_paid) {
      const adv = payment.advance_months && payment.advance_months > 1 ? ` (${payment.advance_months} bln)` : '';
      const amt = Number(payment.paid_amount) || 50000;
      paidRooms.push({
        room: room.room_number,
        name: room.tenant_name,
        adv,
        amount: amt
      });
      totalCollected += amt;
    }
  });

  const occupiedCount = rooms.filter((r) => r.is_occupied).length;

  return `*✅ DAFTAR IURAN LUNAS KAS KOS KLEBENGAN*
*Periode: ${periodName?.toUpperCase() || 'BULAN INI'}*
━━━━━━━━━━━━━━━━━━━━━━
Terima kasih banyak kepada teman-teman penghuni yang telah menyelesaikan pembayaran iuran kas kos:

${paidRooms.length > 0 ? paidRooms.map((r, i) => `${i + 1}. Kamar ${r.room} - Mas ${r.name}${r.adv} (Lunas)`).join('\n') : '• Belum ada pembayaran lunas tercatat'}

━━━━━━━━━━━━━━━━━━━━━━
📊 *Progress:* ${paidRooms.length} dari ${occupiedCount} Kamar Lunas
💰 *Total Terkumpul:* ${formatRupiah(totalCollected)}
⏳ *Batas Waktu:* ${formatDate(deadlineDate) || '19 Setiap Bulan'}

Bagi yang belum menyelesaikan pembayaran, mohon dapat melakukan transfer ke rekening bendahara ya. Terima kasih! 🙏`;
}

