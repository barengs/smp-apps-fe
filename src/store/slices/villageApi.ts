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

type GetVillagesResponse = VillageApiData[];

export interface CreateUpdateVillageRequest {
  code: string;
  name: string;
  district_code: string;
}

export const villageApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getVillages: builder.query<GetVillagesResponse, void>({
      query: () => 'region/village',
      providesTags: ['Village'],
    }),
    createVillage: builder.mutation<VillageApiData, CreateUpdateVillageRequest>({
      query: (newVillage) => ({
        url: 'region/village',
        method: 'POST',
        body: newVillage,
      }),
      invalidatesTags: ['Village', 'District'],
    }),
    updateVillage: builder.mutation<VillageApiData, { id: number; data: CreateUpdateVillageRequest }>({
      query: ({ id, data }) => ({
        url: `region/village/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Village', 'District'],
    }),
    deleteVillage: builder.mutation<void, number>({
      query: (id) => ({
        url: `region/village/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Village', 'District'],
    }),
  }),
});

export const {
  useGetVillagesQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
} = villageApi;