/**
 * Format number to Indonesian Rupiah (Rp X.XXX.XXX)
 */
export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format ISO date string or Date to Indonesian readable format (e.g. 19 September 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Short date format (e.g. 19 Sep 2026)
 */
export function formatShortDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Normalizes phone number to Indonesian local format starting with 08...
 * Automatically removes "+62", "62", spaces, dashes (-), parentheses.
 * e.g. "+62 821-4140-2990" -> "082141402990"
 * e.g. "+6281234567890"    -> "081234567890"
 * e.g. "62 821-4140-2990"  -> "082141402990"
 * e.g. "821-4140-2990"     -> "082141402990"
 * e.g. "0821-4140-2990"    -> "082141402990"
 */
export function formatPhoneNumber(input) {
  if (!input) return '';
  let str = String(input).trim();
  
  // Replace +62 or 62 at start or preceded by non-digit
  str = str.replace(/(?:^|\D)\+?62/g, '0');
  
  // Strip all non-digit characters
  let digits = str.replace(/\D/g, '');
  
  // If digits still start with 62 (e.g. pasted 62821...)
  if (digits.startsWith('62') && digits.length >= 3) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('8') && digits.length >= 2) {
    digits = '0' + digits;
  }
  
  return digits;
}

