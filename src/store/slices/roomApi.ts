import { smpApi } from '../baseApi';
import { Room, CreateUpdateRoomRequest } from '@/types/kepesantrenan';

interface GetRoomsResponse {
  message: string;
  data: Room[];
}

export const roomApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<GetRoomsResponse, void>({
      query: () => 'master/room',
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation<Room, CreateUpdateRoomRequest>({
      query: (newRoom) => ({
        url: 'master/room',
        method: 'POST',
        body: newRoom,
      }),
      invalidatesTags: ['Room'],
    }),
    updateRoom: builder.mutation<Room, { id: number; data: Partial<CreateUpdateRoomRequest> }>({
      query: ({ id, data }) => ({
        url: `master/room/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Room'],
    }),
    deleteRoom: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomApi;