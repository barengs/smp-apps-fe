import { smpApi } from '../baseApi';
import { KelompokPendidikan } from '@/types/pendidikan'; // Menggunakan alias path

type PaginatedResponse<T> = {
  data: T[];
  // tambahkan properti paginasi lain jika ada
};

export const educationClassApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationClasses: builder.query<KelompokPendidikan[], void>({
      query: () => 'master/education-class',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'EducationClass' as const, id })), // Perbaiki id menjadi id dari objek
              { type: 'EducationClass', id: 'LIST' },
            ]
          : [{ type: 'EducationClass', id: 'LIST' }],
      transformResponse: (response: { data: KelompokPendidikan[] }) => response.data,
    }),
    addEducationClass: builder.mutation<KelompokPendidikan, Omit<KelompokPendidikan, 'id'>>({
      query: (body) => ({
        url: 'master/education-class',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'EducationClass', id: 'LIST' }],
    }),
    // TODO: Tambahkan mutasi untuk update dan delete di sini
  }),
});

export const {
  useGetEducationClassesQuery,
  useAddEducationClassMutation,
} = educationClassApi;