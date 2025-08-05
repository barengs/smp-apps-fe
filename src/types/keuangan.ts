export interface Transaksi {
  id: number;
  santri_name: string;
  account_number: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTransaksiResponse {
  current_page: number;
  data: Transaksi[];
  first_page_url: string;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TransaksiApiResponse {
    message: string;
    status: number;
    data: PaginatedTransaksiResponse;
}

export interface SingleTransaksiApiResponse {
    message: string;
    status: number;
    data: Transaksi;
}