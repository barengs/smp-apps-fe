import { smpApi } from '../baseApi';

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

// The GET response is a direct array
type GetProgramsResponse = ProgramApiData[];

// Structure for the POST/PUT request body
export interface CreateUpdateProgramRequest {
  name: string;
  description?: string;
}

export const programApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<GetProgramsResponse, void>({
      query: () => 'master/program',
      providesTags: ['Program'],
    }),
    createProgram: builder.mutation<ProgramApiData, CreateUpdateProgramRequest>({
      query: (newProgram) => ({
        url: 'master/program',
        method: 'POST',
        body: newProgram,
      }),
      invalidatesTags: ['Program'],
    }),
    updateProgram: builder.mutation<ProgramApiData, { id: number; data: CreateUpdateProgramRequest }>({
      query: ({ id, data }) => ({
        url: `master/program/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Program'],
    }),
    deleteProgram: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/program/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Program'],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programApi;