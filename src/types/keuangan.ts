export interface Transaksi {
  id: string;
  transaction_type: string | TransactionType; // Updated to allow TransactionType object
  transaction_type_id?: string; // Added based on sample JSON
  description: string;
  amount: string;
  status: string;
  reference_number: string;
  channel: string;
  source_account: Account | string | null; // Updated to allow Account object, string, or null
  destination_account: Account | string | null; // Updated to allow Account object, string, or null
  created_at: string;
  updated_at: string;
  ledger_entries?: any[]; // Added based on sample JSON
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
  default_debit_coa: string | null; // Renamed from coa_debit_code
  default_credit_coa: string | null; // Renamed from coa_credit_code
  description?: string; // Added for table display
  is_active?: boolean; // Added for table display
}

// New interface for the paginated response data
export interface PaginatedTransactionTypes {
    current_page: number;
    data: TransactionType[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Updated top-level API response for transaction types list
export interface TransactionTypeApiResponse {
    message: string;
    status: string;
    data: PaginatedTransactionTypes;
}


export interface CreateUpdateTransactionTypeRequest {
  code: string;
  name: string;
  category: 'transfer' | 'payment' | 'cash_operation' | 'fee'; // Diperbarui menjadi huruf kecil
  is_debit: boolean;
  is_credit: boolean;
  default_debit_coa?: string | null; // Renamed from coa_debit_code, optional for request
  default_credit_coa?: string | null; // Renamed from coa_credit_code, optional for request
}

// --- Tipe untuk Rekening (Account) ---

export interface AccountCustomer {
  id: number;
  parent_id: string;
  nis: string;
  period: string;
  nik: string;
  kk: string;
  first_name: string;
  last_name: string | null;
  gender: string;
  address: string;
  born_in: string;
  born_at: string;
  last_education: string;
  village_id: number | null;
  village: string;
  district: string;
  postal_code: string;
  phone: string;
  hostel_id: string;
  program_id: string;
  status: string;
  photo: string | null;
  user_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountProduct {
  id: number;
  product_code: string;
  product_name: string;
  product_type: string;
  interest_rate: string;
  admin_fee: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  account_number: string;
  customer_id: string; // Changed to string based on JSON
  product_id: string; // Changed to string based on JSON
  balance: string;
  status: string; // e.g., "TIDAK AKTIF"
  open_date: string;
  close_date: string | null;
  customer?: AccountCustomer; // Made optional
  student?: any; // Added student property
  product?: AccountProduct; // Made optional
  created_at: string;
  updated_at: string;
}

// Mengubah AccountApiResponse menjadi langsung array Account[]
export type AccountApiResponse = Account[];

// Mengubah SingleAccountApiResponse menjadi langsung Account
export type SingleAccountApiResponse = Account;

export interface CreateUpdateAccountRequest {
  student_id: number; // Changed from customer_id to student_id
  product_id: number;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';
  open_date: string; // Format YYYY-MM-DD
}

// --- Payment Package Interfaces ---

export interface PaymentPackageItem {
  id: number;
  package_id: number;
  item_name: string;
  category: 'pendidikan' | 'asrama' | 'konsumsi' | 'kesehatan' | 'saku' | 'lainnya';
  amount: string;
  is_saku: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentPackage {
  id: number;
  package_code: string;
  package_name: string;
  description: string | null;
  academic_year: string | null;
  semester: 'ganjil' | 'genap' | null;
  total_amount: string;
  saku_amount: string;
  is_active: boolean;
  items?: PaymentPackageItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateUpdatePaymentPackageRequest {
  package_code: string;
  package_name: string;
  description?: string;
  academic_year?: string;
  semester?: 'ganjil' | 'genap';
  is_active?: boolean;
  items: {
    item_name: string;
    category: 'pendidikan' | 'asrama' | 'konsumsi' | 'kesehatan' | 'saku' | 'lainnya';
    amount: number;
    is_saku?: boolean;
  }[];
}

// --- Payment Record Interfaces ---

export interface PaymentRecordItem {
  id: number;
  payment_record_id: number;
  package_item_id: number;
  item_name: string;
  category: string;
  amount: string;
  is_saku: boolean;
}

export interface PaymentRecord {
  id: number;
  account_number: string;
  package_id: number;
  top_up_request_id: number | null;
  reference_number: string;
  total_amount: string;
  saku_allocated: string;
  status: 'pending' | 'paid' | 'partial' | 'cancelled';
  paid_at: string;
  processed_by: number | null;
  notes: string | null;
  account?: Account;
  package?: PaymentPackage;
  items?: PaymentRecordItem[];
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  account_number: string;
  package_id: number;
  top_up_request_id?: number;
  notes?: string;
}

// --- Koperasi Transaction Interfaces ---

export interface KoperasiTransaction {
  id: number;
  account_number: string;
  reference_number: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  outlet_name: string | null;
  item_description: string | null;
  cashier_note: string | null;
  account?: Account;
  created_at: string;
  updated_at: string;
}

export interface KoperasiCheckResponse {
  account_number: string;
  customer_name: string;
  balance: string;
  balance_formatted: string;
  student: any;
}

export interface KoperasiDebitRequest {
  account_number: string;
  amount: number;
  item_description?: string;
  outlet_name?: string;
  cashier_note?: string;
}

// --- Setting Interfaces ---

export interface AppSetting {
  id: number;
  key: string;
  value: string;
  group: string;
  label: string | null;
  is_secret: boolean;
}

export interface UpdateSettingsRequest {
  settings: {
    key: string;
    value: string | null;
  }[];
}