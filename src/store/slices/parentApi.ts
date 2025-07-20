import { smpApi } from '../baseApi';

// Structure for the nested "parent" object
interface ParentNestedData {
  id: number;
  first_name: string;
  last_name: string | null;
  kk: string;
  nik: string;
  gender: 'L' | 'P';
  parent_as: string; // e.g., "Ayah", "Ibu"
  // ... other properties if any
}

// Structure for each item in the main "data" array
interface ParentApiData {
  id: number;
  email: string;
  parent: ParentNestedData;
  // ... other properties if any
}

// Structure for the full API response
interface GetParentsResponse {
  message: string;
  data: ParentApiData[];
}

export const parentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getParents: builder.query<GetParentsResponse, void>({
      query: () => 'parent',
      providesTags: ['Parent'],
    }),
    // CRUD endpoints for parents can be added here later
  }),
});

export const { useGetParentsQuery } = parentApi;