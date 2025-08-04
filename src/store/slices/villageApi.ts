import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface NestedDistrictData {
  id: number;
  code: string;
  name: string;
}

interface VillageApiData {
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

// NEW: Interface for GetVillageByNikResponse
interface GetVillageByNikResponse {
  status: string;
  data: {
    id: number;
    code: string;
    name: string;
    district_code: string;
    district: {
      id: number;
      code: string;
      name: string;
    };
  };
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
    createVillage: builder.mutation<VillageApiData, CreateUpdateVillageRequest>({
      query: (newVillage) => ({
        url: 'region/village',
        method: 'POST',
        body: newVillage,
      }),
      invalidatesTags: [{ type: 'Village', id: 'LIST' }, 'District'],
    }),
    updateVillage: builder.mutation<VillageApiData, { id: number; data: CreateUpdateVillageRequest }>({
      query: ({ id, data }) => ({
        url: `region/village/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Village', id }, { type: 'Village', id: 'LIST' }, 'District'],
    }),
    deleteVillage: builder.mutation<void, number>({
      query: (id) => ({
        url: `region/village/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Village', id: 'LIST' }, 'District'],
    }),
    // NEW: Endpoint to get village by NIK
    getVillageByNik: builder.query<GetVillageByNikResponse, string>({
      query: (nik) => `village/nik/${nik}/cek`,
    }),
  }),
});

export const {
  useGetVillagesQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useLazyGetVillageByNikQuery // NEW: Export the lazy query hook
} = villageApi;