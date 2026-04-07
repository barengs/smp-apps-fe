import { smpApi } from '../baseApi';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export interface Student {
  id: number;
  parent_id: string;
  nis: string;
  period: string;
  nik: string;
  kk: string;
  first_name: string;
  last_name: string | null;
  gender: string;
  address: string;
  born_in: string;
  born_at: string;
  last_education: string;
  village_id: number | null;
  village: string;
  district: string;
  postal_code: string;
  phone: string;
  hostel_id: string;
  program_id: string;
  status: string;
  photo: string | null;
  user_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  students: Student[];
  parent: {
    id: number;
    kk: string;
    nik: string;
    parent_id: number | null;
    user_id: string;
    parent_as: string;
    first_name: string;
    last_name: string | null;
    gender: string;
    card_address: string | null;
    domicile_address: string | null;
    village_id: number | null;
    phone: string | null;
    email: string | null;
    occupation_id: number | null;
    education_id: number | null;

    // ADDED: nested detail untuk pekerjaan dan pendidikan
    occupation?: { id: number; name: string } | null;
    education?: { id: number; name: string } | null;

    photo: string | null;
    photo_path: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  roles: Array<{
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: string;
      role_id: string;
    };
  }>;
}

export interface CreateUpdateParentRequest {
  email: string;
  parent: {
    first_name: string;
    last_name?: string | null;
    kk: string;
    nik: string;
    gender: string;
    parent_as: string;
    phone?: string | null;
    email?: string | null;
    domicile_address?: string | null;
    card_address?: string | null;
    occupation_id?: number | null;
    education_id?: number | null;
  };
}

// Izinkan update payload berupa nested lama atau flat baru
export type UpdateParentPayload = CreateUpdateParentRequest | Record<string, unknown>;

export interface ImportParentResponse {
  success: boolean;
  message: string;
  data: {
    success_count: number;
    skipped_count: number;
    failure_count: number;
    total: number;
    info: string;
    warnings: string[];
  };
}

export const parentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getParents: builder.query<Parent[], PaginationParams | void>({
      query: (params) => {
        if (!params) return 'main/parent';
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        return `main/parent?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        if (Array.isArray(response?.data)) {
          return response.data as Parent[];
        }
        if (Array.isArray(response?.data?.data)) {
          return response.data.data as Parent[];
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Parent' as const, id })),
            { type: 'Parent', id: 'LIST' },
          ]
          : [{ type: 'Parent', id: 'LIST' }],
    }),
    getParentById: builder.query<Parent, number>({
      query: (id) => `main/parent/${id}`,
      transformResponse: (response: { data: Parent }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),
    createParent: builder.mutation<Parent, CreateUpdateParentRequest>({
      query: (newParent) => ({
        url: 'main/parent',
        method: 'POST',
        body: newParent,
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    updateParent: builder.mutation<Parent, { id: number; data: UpdateParentPayload }>({
      query: ({ id, data }) => ({
        url: `main/parent/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Parent', id }, { type: 'Parent', id: 'LIST' }],
    }),
    deleteParent: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/parent/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    getParentByNik: builder.query<Parent, string>({
      query: (nik) => `main/parent/nik/${nik}`,
      transformResponse: (response: any) => {
        // Backend returns { status: 'success', data: { ...parentProfile } }
        // or just the data. We normalize it to the Parent interface structure.
        const data = response?.data || response;
        if (data && !data.parent) {
          return { ...data, parent: data } as Parent;
        }
        return data as Parent;
      },
      providesTags: (result, error, nik) => [{ type: 'Parent', id: nik }],
    }),
    exportParents: builder.mutation<Blob, void>({
      query: () => ({
        url: 'main/parent/export',
        method: 'GET',
        responseHandler: (response) => response.blob(),
        cache: 'no-cache',
      }),
    }),
    backupParents: builder.mutation<Blob, void>({
      query: () => ({
        url: 'main/parent/backup',
        method: 'GET',
        responseHandler: (response) => response.blob(),
        cache: 'no-cache',
      }),
    }),
    importParents: builder.mutation<ImportParentResponse, FormData>({
      query: (formData) => ({
        url: 'main/parent/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    // Upload foto wali santri secara terpisah
    updateParentPhoto: builder.mutation<{ message: string; photo: string }, { id: number; photo: File }>({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append('photo', photo);
        return {
          url: `main/parent/${id}/update-photo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Parent', id },
        { type: 'Parent', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetParentsQuery,
  useGetParentByIdQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useGetParentByNikQuery,
  useLazyGetParentByNikQuery,
  useExportParentsMutation,
  useBackupParentsMutation,
  useImportParentsMutation,
  useUpdateParentPhotoMutation,
} = parentApi;