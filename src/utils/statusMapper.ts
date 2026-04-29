/**
 * Utility to map registration status keys (from backend) to user-friendly Indonesian labels.
 * Handles both English and potential Indonesian keys for robustness.
 */

export const getRegistrationStatusLabel = (status: string): string => {
  const s = (status || '').toLowerCase();
  
  const mapping: Record<string, string> = {
    'draft': 'Draf',
    'pending': 'Menunggu',
    'verified': 'Terverifikasi',
    'rejected': 'Ditolak',
    'accepted': 'Diterima',
    // Fallbacks for Indonesian keys if they exist in DB
    'draf': 'Draf',
    'menunggu': 'Menunggu',
    'terverifikasi': 'Terverifikasi',
    'ditolak': 'Ditolak',
    'diterima': 'Diterima',
  };

  return mapping[s] || status;
};

/**
 * Utility to map payment status keys to user-friendly Indonesian labels.
 */
export const getPaymentStatusLabel = (status: string): string => {
  const s = (status || '').toLowerCase();
  
  const mapping: Record<string, string> = {
    'pending': 'Menunggu Pembayaran',
    'paid': 'Sudah Dibayar',
    'completed': 'Selesai',
    'failed': 'Gagal',
    // Fallbacks
    'menunggu': 'Menunggu Pembayaran',
    'lunas': 'Sudah Dibayar',
    'sukses': 'Sudah Dibayar',
  };

  return mapping[s] || status;
};
