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