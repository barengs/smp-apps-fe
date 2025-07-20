import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Structure for a single province object from the API
interface ProvinceApiData {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Structure for the GET /master/province response
interface GetProvincesResponse {
  message: string;
  data: ProvinceApiData[];
}

// Structure for the POST/PUT request body
export interface CreateUpdateProvinceRequest {
  name: string;
}

export const provinceApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<GetProvincesResponse, void>({
      query: () => 'master/province',
      providesTags: ['Province'],
    }),
    createProvince: builder.mutation<ProvinceApiData, CreateUpdateProvinceRequest>({
      query: (newProvince) => ({
        url: 'master/province',
        method: 'POST',
        body: newProvince,
      }),
      invalidatesTags: ['Province'],
    }),
    updateProvince: builder.mutation<ProvinceApiData, { id: number; data: CreateUpdateProvinceRequest }>({
      query: ({ id, data }) => ({
        url: `master/province/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Province'],
    }),
    deleteProvince: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/province/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Province'],
    }),
  }),
});

export const {
  useGetProvincesQuery,
  useCreateProvinceMutation,
  useUpdateProvinceMutation,
  useDeleteProvinceMutation,
} = provinceApi;