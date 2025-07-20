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

// --- Types for Single Parent Detail ---

// Structure for a single student associated with the parent
interface AssociatedStudent {
  id: number;
  first_name: string;
  last_name: string | null;
  nis: string;
  status: string;
}

// Structure for the detailed parent data
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
    address?: string;
    photo?: string | null;
  };
  students: AssociatedStudent[]; // Array of their children
  created_at: string;
  updated_at: string;
}

// Structure for the full API response for a single parent
interface GetParentByIdResponse {
  message: string;
  data: ParentDetailData;
}

export const parentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getParents: builder.query<GetParentsResponse, void>({
      query: () => 'parent',
      providesTags: ['Parent'],
    }),
    getParentById: builder.query<GetParentByIdResponse, number>({
      query: (id) => `parent/${id}`,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),
    // CRUD endpoints for parents can be added here later
  }),
});

export const { useGetParentsQuery, useGetParentByIdQuery } = parentApi;