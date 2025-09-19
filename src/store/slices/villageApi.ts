import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface NestedDistrictData {
  id: number;
  code: string;
  name: string;
}

export interface VillageApiData { // Exported for use in other files if needed
  id: number;
  code: string;
  district_code: string;
  name: string;
  district: NestedDistrictData;
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
      query: ({ page, per_page }) => `region/village?page=${page}&per_page=${per_page}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Village' as const, id })),
              { type: 'Village', id: 'LIST' },
            ]
          : [{ type: 'Village', id: 'LIST' }],
    }),
    getVillagesByDistrict: builder.query<VillageApiData[], string>({
      query: (districtCode) => `master/village/district/${districtCode}`,
      transformResponse: (response: GetVillagesByDistrictResponse) => {
        console.log('Raw response from getVillagesByDistrict:', response);
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Village' as const, id })),
              { type: 'Village', id: 'LIST' },
            ]
          : [{ type: 'Village', id: 'LIST' }],
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
    // Corrected: Endpoint to get village by NIK, now returns an array
    getVillageByNik: builder.query<VillageApiData[], string>({
      query: (nik) => `master/village/${nik}/nik`,
      transformResponse: (response: GetVillageByNikRawResponse) => response.data, // Extract the array from the 'data' property
    }),
  }),
});

export const {
  useLazyGetVillagesQuery, // Mengubah ini menjadi lazy query
  useGetVillagesByDistrictQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useLazyGetVillageByNikQuery
} = villageApi;