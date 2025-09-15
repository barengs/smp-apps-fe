import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Structure for the nested province object within a city
interface NestedProvinceData {
  id: number;
  code: string;
  name: string;
}

// Structure for a single city object from the API
interface CityApiData {
  id: number;
  code: string;
  province_code: string;
  name: string;
  province: NestedProvinceData;
}

// The GET response is a direct array of cities
type GetCitiesResponse = CityApiData[];

// Structure for the POST/PUT request body
export interface CreateUpdateCityRequest {
  code: string;
  name: string;
  province_code: string;
}

export const cityApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<GetCitiesResponse, void>({
      query: () => 'master/city',
      providesTags: ['City'],
    }),
    createCity: builder.mutation<CityApiData, CreateUpdateCityRequest>({
      query: (newCity) => ({
        url: 'master/city',
        method: 'POST',
        body: newCity,
      }),
      invalidatesTags: ['City', 'Province'], // Invalidate both to be safe
    }),
    updateCity: builder.mutation<CityApiData, { id: number; data: CreateUpdateCityRequest }>({
      query: ({ id, data }) => ({
        url: `master/city/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['City', 'Province'],
    }),
    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/city/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['City', 'Province'],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = cityApi;