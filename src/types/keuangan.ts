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

// --- Tipe untuk Rekening (Account) ---

export interface AccountCustomer {
  id: number;
  name: string;
  nis: string;
}

export interface AccountProduct {
  id: number;
  name: string;
  type: string;
}

export interface Account {
  account_number: string;
  customer_id: number;
  product_id: number;
  balance: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';
  open_date: string;
  close_date: string | null;
  customer: AccountCustomer;
  product: AccountProduct;
}

// Mengubah AccountApiResponse menjadi langsung array Account[]
export type AccountApiResponse = Account[];

export interface SingleAccountApiResponse {
  message: string;
  data: Account;
}

export interface CreateUpdateAccountRequest {
  student_id: number; // Changed from customer_id to student_id
  product_id: number;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';
  open_date: string; // Format YYYY-MM-DD
}