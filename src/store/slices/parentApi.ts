import { smpApi } from '../baseApi';

// Structure for the nested "parent" object in the list view
interface ParentNestedData {
  id: number;
  first_name: string;
  last_name: string | null;
  kk: string;
  nik: string;
  gender: 'L' | 'P';
  parent_as: string;
}

// Structure for each item in the main "data" array for the list view
interface ParentApiData {
  id: number;
  email: string;
  parent: ParentNestedData;
}

// Structure for the full API response for the list view
interface GetParentsResponse {
  message: string;
  data: ParentApiData[];
}

// --- Types for Single Parent Detail (used by getParentById) ---
// Structure for a single student associated with the parent
interface AssociatedStudent {
  id: number;
  first_name: string;
  last_name: string | null;
  nis: string;
  status: string;
}

// Structure for the detailed parent data (used by getParentById)
interface ParentDetailData {
  id: number;
  email: string;
  parent: {
    id: number;
    first_name: string;
    last_name: string | null;
    kk: string;
    nik: string;
    gender: 'L' | 'P';
    parent_as: string;
    phone?: string;
    card_address?: string;
    photo?: string | null;
  };
  students: AssociatedStudent[]; // Array of their children
  created_at: string;
  updated_at: string;
}

// Structure for the full API response for a single parent (used by getParentById)
interface GetParentByIdResponse {
  message: string;
  data: ParentDetailData;
}

// --- NEW Types for getParentByNik endpoint ---
// Structure for the 'data' property returned by parent/nik/{nik}/cek
interface GetParentByNikResponseData {
  kk: string;
  nik: string;
  parent_as: string;
  first_name: string;
  last_name: string | null;
  gender: 'L' | 'P';
  card_address: string | null;
  domicile_address: string | null;
  village_id: number | null;
  phone: string | null;
  email: string | null;
  occupation: string | null;
  education: string | null;
  photo: string | null;
  photo_path: string | null;
}

// Full response structure for parent/nik/{nik}/cek
interface GetParentByNikResponse {
  status: string;
  data: GetParentByNikResponseData;
}

// Request body for creating/updating a parent
export interface CreateUpdateParentRequest {
  first_name: string;
  last_name?: string | null;
  email: string;
  kk: string;
  nik: string;
  gender: 'L' | 'P';
  parent_as: string;
  phone?: string | null;
  card_address?: string | null;
  photo?: string | null;
}

export const parentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getParents: builder.query<GetParentsResponse, void>({
      query: () => 'main/parent',
      providesTags: ['Parent'],
    }),
    getParentById: builder.query<GetParentByIdResponse, number>({
      query: (id) => `main/parent/${id}`,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),
    // Updated to use the new response type
    getParentByNik: builder.query<GetParentByNikResponse, string>({
      query: (nik) => `main/parent/nik/${nik}/cek`,
    }),
    createParent: builder.mutation<ParentApiData, CreateUpdateParentRequest>({
      query: (newParent) => ({
        url: 'main/parent',
        method: 'POST',
        body: newParent,
      }),
      invalidatesTags: ['Parent'],
    }),
    updateParent: builder.mutation<ParentApiData, { id: number; data: CreateUpdateParentRequest }>({
      query: ({ id, data }) => ({
        url: `main/parent/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Parent'],
    }),
  }),
});

export const { useGetParentsQuery, useGetParentByIdQuery, useCreateParentMutation, useUpdateParentMutation, useLazyGetParentByNikQuery } = parentApi;