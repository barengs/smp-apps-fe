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
      transformResponse: (response: { data: PaginatedResponse<Room> }) => response.data,
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