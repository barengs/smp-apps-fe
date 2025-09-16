import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Updated structure for a single province object from the API
interface ProvinceApiData {
  id: number;
  code: string;
  name: string;
}

// Raw response structure from the API with 'data' wrapper
interface GetProvincesRawResponse {
  data: ProvinceApiData[];
}

// The GET response is now a direct array after transformation
type GetProvincesResponse = ProvinceApiData[];

// Updated structure for the POST/PUT request body
export interface CreateUpdateProvinceRequest {
  code: string;
  name: string;
}

export const provinceApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<GetProvincesResponse, void>({
      query: () => 'master/province', // Updated endpoint
      transformResponse: (response: GetProvincesRawResponse) => response.data, // Extract the array from the 'data' property
      providesTags: ['Province'],
    }),
    createProvince: builder.mutation<ProvinceApiData, CreateUpdateProvinceRequest>({
      query: (newProvince) => ({
        url: 'master/province', // Updated endpoint
        method: 'POST',
        body: newProvince,
      }),
      invalidatesTags: ['Province'],
    }),
    updateProvince: builder.mutation<ProvinceApiData, { id: number; data: CreateUpdateProvinceRequest }>({
      query: ({ id, data }) => ({
        url: `master/province/${id}`, // Updated endpoint
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Province'],
    }),
    deleteProvince: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/province/${id}`, // Updated endpoint
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