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

// Structure for the raw GET /hostel response with pagination
interface GetHostelsRawResponse {
  message: string;
  status?: number;
  data: any[]; // array of hostel items
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
    getHostels: builder.query<{ data: HostelApiData[] }, void>({
      query: () => 'master/hostel',
      transformResponse: (response: GetHostelsRawResponse) => {
        const arr = Array.isArray(response?.data) ? response.data : [];
        // Normalisasi minimal (capacity ke number jika string)
        const normalized: HostelApiData[] = arr.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          description: item.description ?? '',
          program: {
            id: Number(item?.program?.id ?? item.program_id ?? 0),
            name: item?.program?.name ?? '',
          },
          capacity:
            typeof item.capacity === 'string'
              ? parseInt(item.capacity || '0', 10)
              : Number(item.capacity ?? 0),
        }));
        return { data: normalized };
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((h) => ({ type: 'Hostel' as const, id: h.id })),
              { type: 'Hostel' as const, id: 'LIST' },
            ]
          : [{ type: 'Hostel' as const, id: 'LIST' }],
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