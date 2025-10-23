import { smpApi } from '../baseApi';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

// --- API Response and Request Types ---

// Structure for a single hostel object nested within a program
interface HostelInfo {
  id: number;
  name: string;
  capacity: number;
}

// Structure for a single program object from the API, now including hostels
interface ProgramApiData {
  id: number;
  name: string;
  description: string;
  hostels?: HostelInfo[]; // Array of associated hostels
}

// New interface for the raw API response for getPrograms
interface GetProgramsRawResponse {
  data: PaginatedResponse<ProgramApiData>; // Wrap in PaginatedResponse
}

// The GET response is a direct array
// type GetProgramsResponse = ProgramApiData[]; // This type is no longer directly used for the query return type

// Structure for the POST/PUT request body
export interface CreateUpdateProgramRequest {
  name: string;
  description?: string;
}

export const programApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<PaginatedResponse<ProgramApiData>, PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `master/program?${queryParams.toString()}`;
      },
      transformResponse: (response: GetProgramsRawResponse): PaginatedResponse<ProgramApiData> => {
        // Jika backend mengembalikan {success: true, data: [...]} tanpa wrapper paginasi
        if (response.data && Array.isArray(response.data)) {
          return {
            current_page: 1,
            last_page: 1,
            per_page: response.data.length,
            total: response.data.length,
            first_page_url: '',
            from: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            prev_page_url: null,
            to: response.data.length,
            data: response.data,
          };
        }
        // Jika format paginasi sudah sesuai, kembalikan apa adanya
        return response.data;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Program' as const, id })),
              { type: 'Program', id: 'LIST' },
            ]
          : [{ type: 'Program', id: 'LIST' }],
    }),
    createProgram: builder.mutation<ProgramApiData, CreateUpdateProgramRequest>({
      query: (newProgram) => ({
        url: 'master/program',
        method: 'POST',
        body: newProgram,
      }),
      invalidatesTags: [{ type: 'Program', id: 'LIST' }],
    }),
    updateProgram: builder.mutation<ProgramApiData, { id: number; data: CreateUpdateProgramRequest }>({
      query: ({ id, data }) => ({
        url: `master/program/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Program', id }, { type: 'Program', id: 'LIST' }],
    }),
    deleteProgram: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/program/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Program', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programApi;