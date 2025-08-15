export interface Transaksi {
  id: string;
  transaction_type: string;
  description: string;
  amount: string;
  status: string;
  reference_number: string;
  channel: string;
  source_account: string;
  destination_account: string;
  created_at: string;
  updated_at: string;
}

export interface TransaksiApiResponse {
    message: string;
    status: number;
    data: Transaksi[];
}

export interface SingleTransaksiApiResponse {
    message: string;
    status: number;
    data: Transaksi;
}

// Tipe baru untuk Jenis Transaksi
export interface TransactionType {
  id: number;
  code: string;
  name: string;
  category: 'transfer' | 'payment' | 'cash_operation' | 'fee'; // Diperbarui menjadi huruf kecil
  is_debit: boolean;
  is_credit: boolean;
}

export interface TransactionTypeApiResponse {
    message: string;
    status: number;
    data: TransactionType[];
}

export interface CreateUpdateTransactionTypeRequest {
  code: string;
  name: string;
  category: 'transfer' | 'payment' | 'cash_operation' | 'fee'; // Diperbarui menjadi huruf kecil
  is_debit: boolean;
  is_credit: boolean;
}

// Tipe baru untuk Rekening (Account)
export interface Account {
  id: number;
  account_number: string;
  balance: number;
  status: 'active' | 'inactive' | 'frozen';
  created_at: string;
  updated_at: string;
  santri: {
    id: number;
    nama: string;
  };
  produk: {
    id: number;
    name: string;
  };
}

export interface AccountApiResponse {
  message: string;
  status: number;
  data: Account[];
}

export interface CreateUpdateAccountRequest {
  santri_id?: number; // FIX: Made optional
  produk_id?: number; // FIX: Made optional
  status: 'active' | 'inactive' | 'frozen';
}