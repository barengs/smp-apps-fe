import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

export interface LeaveType {
  id: number;
  name: string;
  description: string;
  requires_approval: boolean;
  max_duration_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GetLeaveTypesResponse {
  data: LeaveType[] | { data: LeaveType[] };
  links?: any;
  meta?: any;
}

export const leaveTypeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveTypes: builder.query<LeaveType[], PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.per_page) queryParams.append('per_page', String(params.per_page));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        const qs = queryParams.toString();
        return qs ? `master/leave-type?${qs}` : 'master/leave-type';
      },
      transformResponse: (response: GetLeaveTypesResponse): LeaveType[] => {
        const d = (response as any)?.data;
        if (Array.isArray(d)) return d as LeaveType[];
        if (Array.isArray(d?.data)) return d.data as LeaveType[];
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'LeaveType' as const, id: item.id })),
              { type: 'LeaveType' as const, id: 'LIST' },
            ]
          : [{ type: 'LeaveType' as const, id: 'LIST' }],
    }),
    createLeaveType: builder.mutation<LeaveType, Partial<Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>>>({
      query: (body) => ({
        url: 'master/leave-type',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LeaveType', id: 'LIST' }],
    }),
    updateLeaveType: builder.mutation<LeaveType, { id: number; data: Partial<Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>> }>({
      query: ({ id, data }) => ({
        url: `master/leave-type/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'LeaveType', id: arg.id }, { type: 'LeaveType', id: 'LIST' }],
    }),
    deleteLeaveType: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `master/leave-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'LeaveType', id }, { type: 'LeaveType', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} = leaveTypeApi;