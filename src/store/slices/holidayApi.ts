import { smpApi } from '../baseApi';

export interface HolidayRequirement {
    id: number;
    holiday_period_id: number;
    name: string;
    description: string | null;
}

export interface HolidayPeriod {
    id: number;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: 'active' | 'inactive';
    requirements: HolidayRequirement[];
}

export interface StudentHolidayRequirementStatus {
    id: number;
    name: string;
    is_met: boolean;
}

export interface StudentHolidayCheck {
    id: number;
    name: string;
    nis: string;
    check: {
        id: number;
        checkout_at: string | null;
        checkin_at: string | null;
    } | null;
    requirements: StudentHolidayRequirementStatus[];
    is_all_met: boolean;
}

export const holidayApi = smpApi.injectEndpoints({
    endpoints: (builder) => ({
        getHolidayPeriods: builder.query<{ status: string; data: HolidayPeriod[] }, void>({
            query: () => 'main/holiday',
            providesTags: ['HolidayPeriod'],
        }),
        getHolidayPeriod: builder.query<{ status: string; data: HolidayPeriod }, number | string>({
            query: (id) => `main/holiday/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'HolidayPeriod', id }],
        }),
        createHolidayPeriod: builder.mutation<{ status: string; data: HolidayPeriod }, Partial<HolidayPeriod> & { requirements: Partial<HolidayRequirement>[] }>({
            query: (data) => ({
                url: 'main/holiday',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['HolidayPeriod'],
        }),
        updateHolidayPeriod: builder.mutation<{ status: string; data: HolidayPeriod }, { id: number; data: Partial<HolidayPeriod> & { requirements: Partial<HolidayRequirement>[] } }>({
            query: ({ id, data }) => ({
                url: `main/holiday/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['HolidayPeriod'],
        }),
        deleteHolidayPeriod: builder.mutation<{ status: string; message: string }, number>({
            query: (id) => ({
                url: `main/holiday/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['HolidayPeriod'],
        }),
        getHolidayStudents: builder.query<{ status: string; data: StudentHolidayCheck[] }, { id: number | string; search?: string }>({
            query: ({ id, search }) => ({
                url: `main/holiday/${id}/students`,
                params: { search },
            }),
            providesTags: (_result, _error, { id }) => [{ type: 'HolidayStudent', id }],
        }),
        toggleRequirement: builder.mutation<{ status: string; is_met: boolean }, { periodId: number; studentId: number; requirementId: number }>({
            query: ({ periodId, studentId, requirementId }) => ({
                url: `main/holiday/${periodId}/students/${studentId}/toggle-requirement/${requirementId}`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, { periodId }) => [{ type: 'HolidayStudent', id: periodId }],
        }),
        checkoutStudent: builder.mutation<{ status: string; checkout_at: string }, { periodId: number; studentId: number }>({
            query: ({ periodId, studentId }) => ({
                url: `main/holiday/${periodId}/students/${studentId}/checkout`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, { periodId }) => [{ type: 'HolidayStudent', id: periodId }],
        }),
        checkinStudent: builder.mutation<{ status: string; checkin_at: string }, { periodId: number; studentId: number }>({
            query: ({ periodId, studentId }) => ({
                url: `main/holiday/${periodId}/students/${studentId}/checkin`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, { periodId }) => [{ type: 'HolidayStudent', id: periodId }],
        }),
        checkoutByNis: builder.mutation<{ status: string; message: string; data: any }, { nis: string }>({
            query: (data) => ({
                url: 'main/holiday/checkout-nis',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['HolidayStudent'],
        }),
        checkinByNis: builder.mutation<{ status: string; message: string; data: any }, { nis: string }>({
            query: (data) => ({
                url: 'main/holiday/checkin-nis',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['HolidayStudent'],
        }),
    }),
});

export const {
    useGetHolidayPeriodsQuery,
    useGetHolidayPeriodQuery,
    useCreateHolidayPeriodMutation,
    useUpdateHolidayPeriodMutation,
    useDeleteHolidayPeriodMutation,
    useGetHolidayStudentsQuery,
    useToggleRequirementMutation,
    useCheckoutStudentMutation,
    useCheckinStudentMutation,
    useCheckoutByNisMutation,
    useCheckinByNisMutation,
} = holidayApi;
