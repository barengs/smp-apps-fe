import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Structure for a single hostel object from the API
interface HostelApiData {
  id: number;
  name: string;
  description: string;
}

// Structure for the GET /hostel response
interface GetHostelsResponse {
  message: string;
  data: HostelApiData[];
}

// Structure for the POST/PUT request body
export interface CreateUpdateHostelRequest {
  name: string;
  description?: string;
}

export const hostelApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getHostels: builder.query<GetHostelsResponse, void>({
      query: () => 'master/hostel',
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
  }),
});

export const {
  useGetHostelsQuery,
  useCreateHostelMutation,
  useUpdateHostelMutation,
  useDeleteHostelMutation,
} = hostelApi;