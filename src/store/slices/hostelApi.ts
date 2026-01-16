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
  // NEW: simpan kepala asrama saat ini dan nama hasil turunan
  current_head?: any;
  headName?: string;
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

// NEW: tipe ringkas untuk kepala asrama
export interface HostelHeadCandidate {
  id: number;
  name: string;
  code?: string;
  email?: string | null;
}

export const hostelApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getHostels: builder.query<{ data: HostelApiData[] }, void>({
      query: () => 'master/hostel',
      transformResponse: (response: GetHostelsRawResponse) => {
        const arr = Array.isArray(response?.data) ? response.data : [];
        // Normalisasi minimal (capacity ke number jika string) + tambahkan current_head dan headName
        const normalized: HostelApiData[] = arr.map((item: any) => {
          const currentHead = item?.current_head ?? null;
          const staff = currentHead?.staff;
          const headFirst = staff?.first_name ?? '';
          const headLast = staff?.last_name ?? '';
          const derivedHeadName =
            `${headFirst} ${headLast}`.trim() ||
            staff?.user?.name ||
            currentHead?.name ||
            undefined;

          return {
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
            current_head: currentHead,
            headName: derivedHeadName,
          };
        });
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

    // NEW: ambil kandidat kepala asrama dari endpoint terbaru
    getHostelHeads: builder.query<HostelHeadCandidate[], void>({
      query: () => 'master/hostel/staff/heads',
      transformResponse: (response: any): HostelHeadCandidate[] => {
        const arr = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        return arr.map((it: any) => ({
          id: Number(it?.id ?? it?.staff_id ?? 0),
          name:
            it?.name ||
            [it?.first_name, it?.last_name].filter(Boolean).join(' ') ||
            it?.user?.name ||
            it?.staff?.user?.name ||
            it?.staff?.name ||
            '',
          code: it?.code ?? undefined,
          email: it?.email ?? it?.user?.email ?? it?.staff?.user?.email ?? null,
        }));
      },
      providesTags: ['Hostel'],
    }),

    exportHostels: builder.mutation<Blob, void>({
      query: () => ({
        url: 'master/hostel/export',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    backupHostels: builder.mutation<Blob, void>({
      query: () => ({
        url: 'master/hostel/backup',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
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
  // NEW: export hook kandidat kepala asrama
  useGetHostelHeadsQuery,
  useExportHostelsMutation,
  useBackupHostelsMutation,
} = hostelApi;