import { smpApi } from '../baseApi';
import { Room, CreateUpdateRoomRequest } from '@/types/kepesantrenan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export const roomApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<PaginatedResponse<Room>, PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `master/room?${queryParams.toString()}`;
      },
      transformResponse: (response: any): PaginatedResponse<Room> => {
        const raw = response?.data;

        const normalizeRoom = (r: any): Room => ({
          id: Number(r.id),
          name: r.name,
          hostel_id: Number(r.hostel_id),
          capacity: Number(r.capacity),
          description: r.description ?? '',
          is_active:
            r.is_active === true ||
            r.is_active === 1 ||
            r.is_active === '1',
          hostel: {
            id: Number(r?.hostel?.id ?? r.hostel_id),
            name: r?.hostel?.name ?? '',
          },
        });

        // Jika backend mengirim array sederhana: { success, message, data: [...] }
        if (Array.isArray(raw)) {
          const data = raw.map(normalizeRoom);
          return {
            current_page: 1,
            data,
            first_page_url: '',
            from: data.length > 0 ? 1 : 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: data.length,
            prev_page_url: null,
            to: data.length,
            total: data.length,
          };
        }

        // Jika backend sudah mengirim format paginasi, normalisasi itemnya saja
        const paginated = raw as PaginatedResponse<any>;
        const normalizedData = Array.isArray(paginated?.data)
          ? paginated.data.map(normalizeRoom)
          : [];
        return { ...paginated, data: normalizedData };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Room' as const, id })),
              { type: 'Room', id: 'LIST' },
            ]
          : [{ type: 'Room', id: 'LIST' }],
    }),
    getRoomById: builder.query<Room, number>({
      query: (id) => `master/room/${id}`,
      providesTags: (result, error, id) => [{ type: 'Room', id }],
    }),
    createRoom: builder.mutation<Room, CreateUpdateRoomRequest>({
      query: (newRoom) => ({
        url: 'master/room',
        method: 'POST',
        body: newRoom,
      }),
      invalidatesTags: [{ type: 'Room', id: 'LIST' }],
    }),
    updateRoom: builder.mutation<Room, { id: number; data: CreateUpdateRoomRequest }>({
      query: ({ id, data }) => ({
        url: `master/room/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Room', id }, { type: 'Room', id: 'LIST' }],
    }),
    deleteRoom: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Room', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomApi;