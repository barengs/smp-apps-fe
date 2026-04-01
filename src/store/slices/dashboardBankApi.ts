import { bankSmpApi } from '../bankBaseApi';

export interface DashboardSummary {
  rekening: {
    total_aktif: number;
    total_saldo: number;
  };
  topup: {
    today_amount: number;
    pending_count: number;
  };
  payment: {
    month_amount: number;
  };
  koperasi: {
    today_amount: number;
    today_count: number;
  };
  chart_7days: {
    date: string;
    total_credit: number;
    total_debit: number;
  }[];
  recent_topups: any[];
}

export const dashboardBankApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankSummary: builder.query<DashboardSummary, void>({
      query: () => 'main/dashboard/summary',
      transformResponse: (response: { data: DashboardSummary }) => response.data,
      providesTags: ['Transaksi', 'TopUp', 'Account', 'Payment', 'KoperasiTransaction'],
    }),
  }),
});

export const {
  useGetBankSummaryQuery,
} = dashboardBankApi;
