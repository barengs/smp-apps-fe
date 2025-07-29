import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Structure for a single academic year object from the API
export interface TahunAjaranApiData {
  id: number;
  year: string;
  semester: 'Ganjil' | 'Genap';
  active: boolean;
  description: string | null;
}

// The GET response is an object with a 'data' property containing the array
interface GetTahunAjaranResponse {
    data: TahunAjaranApiData[];
}

// The single item response is also wrapped in a 'data' property
interface SingleTahunAjaranResponse {
    data: TahunAjaranApiData;
}

// Structure for the POST/PUT request body
export interface CreateUpdateTahunAjaranRequest {
  year: string;
  semester: 'Ganjil' | 'Genap';
  active?: boolean;
  description?: string;
}

export const tahunAjaranApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTahunAjaran: builder.query<TahunAjaranApiData[], void>({
      query: () => 'master/academic-year',
      providesTags: ['TahunAjaran'],
      transformResponse: (response: GetTahunAjaranResponse) => response.data,
    }),
    createTahunAjaran: builder.mutation<TahunAjaranApiData, CreateUpdateTahunAjaranRequest>({
      query: (newTahunAjaran) => ({
        url: 'master/academic-year',
        method: 'POST',
        body: newTahunAjaran,
      }),
      invalidatesTags: ['TahunAjaran'],
      transformResponse: (response: SingleTahunAjaranResponse) => response.data,
    }),
    updateTahunAjaran: builder.mutation<TahunAjaranApiData, { id: number; data: CreateUpdateTahunAjaranRequest }>({
      query: ({ id, data }) => ({
        url: `master/academic-year/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TahunAjaran'],
      transformResponse: (response: SingleTahunAjaranResponse) => response.data,
    }),
    deleteTahunAjaran: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/academic-year/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TahunAjaran'],
    }),
  }),
});

export const {
  useGetTahunAjaranQuery,
  useCreateTahunAjaranMutation,
  useUpdateTahunAjaranMutation,
  useDeleteTahunAjaranMutation,
} = tahunAjaranApi;