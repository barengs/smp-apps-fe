import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface NestedDistrictData {
  id: number;
  code: string;
  name: string;
}

export interface VillageApiData {
  id: string; // Ubah dari number menjadi string karena response menggunakan string
  code: string;
  district_code: string;
  name: string;
  meta?: {
    lat: string;
    long: string;
    pos: string;
  };
  created_at?: string;
  updated_at?: string;
  district?: NestedDistrictData; // Jadikan optional karena tidak selalu ada di response
}

// Updated response structure for pagination
interface GetVillagesResponse {
  current_page: number;
  data: VillageApiData[];
  next_page_url: string | null;
  per_page: number;
  total: number;
}

// Params for the paginated query
interface GetVillagesParams {
  page: number;
  per_page: number;
}

export interface CreateUpdateVillageRequest {
  code: string;
  name: string;
  district_code: string;
}

// New interface for the raw API response for getVillageByNik
interface GetVillageByNikRawResponse {
  data: VillageApiData[];
}

// New interface for getting villages by district
interface GetVillagesByDistrictResponse {
  data: VillageApiData[];
}

export const villageApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getVillages: builder.query<GetVillagesResponse, GetVillagesParams>({
      query: ({ page, per_page }) => `master/village?page=${page}&per_page=${per_page}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Village' as const, id })),
              { type: 'Village', id: 'LIST' },
            ]
          : [{ type: 'Village', id: 'LIST' }],
    }),
    // Try the correct endpoint format - master/village/{id}/district
    getVillagesByDistrict: builder.query<VillageApiData[], string>({
      query: (districtCode) => {
        console.log('Fetching villages with district code:', districtCode);
        return `master/village/${districtCode}/district`;
      },
      transformResponse: (response: GetVillagesByDistrictResponse) => {
        console.log('Response from getVillagesByDistrict:', response);
        return response.data;
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Village' as const, id })),
              { type: 'Village', id: 'LIST' },
            ]
          : [{ type: 'Village', id: 'LIST' }],
    }),
    // Alternative: Get all villages and filter by district_code
    getAllVillages: builder.query<VillageApiData[], void>({
      query: () => 'master/village?per_page=2000',
      transformResponse: (response: any) => {
        console.log('Raw response from getAllVillages:', response);
        // Handle nested data structure
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && response.data.data) {
          return response.data.data;
        }
        return response;
      },
      providesTags: [{ type: 'Village', id: 'LIST' }],
    }),
    createVillage: builder.mutation<VillageApiData, CreateUpdateVillageRequest>({
      query: (newVillage) => ({
        url: 'master/village',
        method: 'POST',
        body: newVillage,
      }),
      invalidatesTags: [{ type: 'Village', id: 'LIST' }, 'District'],
    }),
    updateVillage: builder.mutation<VillageApiData, { id: number; data: CreateUpdateVillageRequest }>({
      query: ({ id, data }) => ({
        url: `master/village/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Village', id }, { type: 'Village', id: 'LIST' }, 'District'],
    }),
    deleteVillage: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/village/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Village', id: 'LIST' }, 'District'],
    }),
    // Endpoint to get village by NIK
    getVillageByNik: builder.query<VillageApiData[], string>({
      query: (nik) => `master/village/${nik}/nik`,
      transformResponse: (response: GetVillageByNikRawResponse) => response.data,
    }),
  }),
});

export const {
  useLazyGetVillagesQuery,
  useGetVillagesByDistrictQuery,
  useGetAllVillagesQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useLazyGetVillageByNikQuery
} = villageApi;