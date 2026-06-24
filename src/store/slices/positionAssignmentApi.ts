"use client";

import { smpApi } from '../baseApi';
import { Position } from './positionApi';
import { Staff } from './employeeApi';

export interface PositionAssignment {
  id: number;
  position_id: number;
  staff_id: number;
  start_date: string;
  end_date: string | null;
  assignment_letter: string | null;
  notes: string | null;
  is_active: boolean;
  position?: Position;
  staff?: Staff;
}

interface GetPositionAssignmentsResponse {
  message: string;
  data: PositionAssignment[];
}

interface GetPositionAssignmentResponse {
  message: string;
  data: PositionAssignment;
}

export const positionAssignmentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPositionAssignments: builder.query<PositionAssignment[], void>({
      query: () => 'master/position-assignment',
      transformResponse: (response: GetPositionAssignmentsResponse) => response.data,
      providesTags: ['PositionAssignment'],
    }),
    getCurrentAssignments: builder.query<PositionAssignment[], void>({
      query: () => 'master/position-assignment/current',
      transformResponse: (response: GetPositionAssignmentsResponse) => response.data,
      providesTags: ['PositionAssignment'],
    }),
    getAssignmentsByStaff: builder.query<PositionAssignment[], number>({
      query: (staffId) => `master/position-assignment/staff/${staffId}`,
      transformResponse: (response: GetPositionAssignmentsResponse) => response.data,
      providesTags: ['PositionAssignment'],
    }),
    getAssignmentsByPosition: builder.query<PositionAssignment[], number>({
      query: (positionId) => `master/position-assignment/position/${positionId}`,
      transformResponse: (response: GetPositionAssignmentsResponse) => response.data,
      providesTags: ['PositionAssignment'],
    }),
    createPositionAssignment: builder.mutation<PositionAssignment, Partial<PositionAssignment>>({
      query: (body) => ({
        url: 'master/position-assignment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PositionAssignment'],
    }),
    updatePositionAssignment: builder.mutation<PositionAssignment, { id: number; data: Partial<PositionAssignment> }>({
      query: ({ id, data }) => ({
        url: `master/position-assignment/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PositionAssignment', id }, 'PositionAssignment'],
    }),
    deletePositionAssignment: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/position-assignment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PositionAssignment'],
    }),
  }),
});

export const {
  useGetPositionAssignmentsQuery,
  useGetCurrentAssignmentsQuery,
  useGetAssignmentsByStaffQuery,
  useGetAssignmentsByPositionQuery,
  useCreatePositionAssignmentMutation,
  useUpdatePositionAssignmentMutation,
  useDeletePositionAssignmentMutation,
} = positionAssignmentApi;
