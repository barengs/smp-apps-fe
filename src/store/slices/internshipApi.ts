import { smpApi } from '../baseApi';
import { InternshipListItem, InternshipPayload } from '@/types/guruTugas';

export interface GetInternshipsResponse {
  message: string;
  data: InternshipListItem[];
}

export interface CreateInternshipResponse {
    message: string;
    data: InternshipListItem;
}

export const internshipApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getInternships: builder.query<GetInternshipsResponse, void>({
      query: () => 'master/supervisor',
      providesTags: ['Internship'],
    }),
    createInternship: builder.mutation<CreateInternshipResponse, Partial<InternshipPayload>>({
      query: (body) => ({
        url: 'master/supervisor',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Internship'],
    }),
  }),
});

export const { useGetInternshipsQuery, useCreateInternshipMutation } = internshipApi;