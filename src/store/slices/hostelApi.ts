import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Structure for a single hostel object from the API
interface HostelApiData {
  id: number;
  name: string;
  description: string;
  program: { // Menambahkan properti program
    id: number;
    name: string;
  };
  capacity: number; // Menambahkan properti capacity
}

// Structure for the paginated data wrapper (Laravel pagination)
interface PaginatedData<T> {
  current_page: number;
  data: T[]; // This is the array of actual items
  first_page_url: string | null;
  from: number;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Structure for the raw GET /hostel response with pagination
interface GetHostelsRawResponse {
  message: string;
  data: PaginatedData<HostelApiData>; // The actual paginated data is here
}

// Structure for the POST/PUT request body
export interface CreateUpdateHostelRequest {
  name: string;
  description?: string;
  program_id?: number; // Asumsi untuk update/create jika diperlukan
  capacity?: number; // Asumsi untuk update/create jika diperlukan
}

// Structure for the import response
export interface ImportHostelResponse {
  message: string;
}

export interface AssignHostelHeadRequest {
  staff_id: number;
  academic_year_id: number;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export const hostelApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getHostels: builder.query<PaginatedData<HostelApiData>, void>({ // Change return type to PaginatedData<HostelApiData>
      query: () => 'master/hostel',
      transformResponse: (response: GetHostelsRawResponse) => response.data, // Extract the PaginatedData object
      providesTags: ['Hostel'],
    }),
    createHostel: builder.mutation<HostelApiData, CreateUpdateHostelRequest>({
      query: (newHostel) => ({
        url: 'master/hostel',
        method: 'POST',
        body: newHostel,
      }),
      invalidatesTags: ['Hostel'],
    }),
    updateHostel: builder.mutation<HostelApiData, { id: number; data: CreateUpdateHostelRequest }>({
      query: ({ id, data }) => ({
        url: `master/hostel/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Hostel'],
    }),
    deleteHostel: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/hostel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hostel'],
    }),
    importHostels: builder.mutation<ImportHostelResponse, FormData>({
      query: (formData) => ({
        url: 'master/hostel/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Hostel'],
    }),
    assignHostelHead: builder.mutation<{ message: string }, { id: number; data: AssignHostelHeadRequest }>({
      query: ({ id, data }) => ({
        url: `master/hostel/${id}/assign-head`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Hostel'],
    }),
  }),
});

export const {
  useGetHostelsQuery,
  useCreateHostelMutation,
  useUpdateHostelMutation,
  useDeleteHostelMutation,
  useImportHostelsMutation,
  useAssignHostelHeadMutation,
} = hostelApi;