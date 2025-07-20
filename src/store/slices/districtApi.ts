import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface NestedCityData {
  id: number;
  code: string;
  name: string;
}

interface DistrictApiData {
  id: number;
  code: string;
  city_code: string;
  name: string;
  city: NestedCityData;
}

type GetDistrictsResponse = DistrictApiData[];

export interface CreateUpdateDistrictRequest {
  code: string;
  name: string;
  city_code: string;
}

export const districtApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistricts: builder.query<GetDistrictsResponse, void>({
      query: () => 'region/district',
      providesTags: ['District'],
    }),
    createDistrict: builder.mutation<DistrictApiData, CreateUpdateDistrictRequest>({
      query: (newDistrict) => ({
        url: 'region/district',
        method: 'POST',
        body: newDistrict,
      }),
      invalidatesTags: ['District', 'City'],
    }),
    updateDistrict: builder.mutation<DistrictApiData, { id: number; data: CreateUpdateDistrictRequest }>({
      query: ({ id, data }) => ({
        url: `region/district/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['District', 'City'],
    }),
    deleteDistrict: builder.mutation<void, number>({
      query: (id) => ({
        url: `region/district/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['District', 'City'],
    }),
  }),
});

export const {
  useGetDistrictsQuery,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useDeleteDistrictMutation,
} = districtApi;