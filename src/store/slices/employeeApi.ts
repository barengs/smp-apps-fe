import { smpApi } from '../baseApi';

// Define API response structures
interface RoleApiData {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

// Structure for LIST response items
interface StaffInListResponse {
  id: number;
  name: string; // Username
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  staff: {
    id: number;
    user_id: string;
    code: string;
    first_name: string;
    last_name: string;
    gender: string;
    nik: string | null;
    nip: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    village_id: string | null;
    zip_code: string | null;
    photo: string | null;
    marital_status: string;
    job_id: string | null;
    status: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  roles: RoleApiData[];
}

// Structure for DETAIL response
interface StaffDetailResponse {
  id: number;
  user_id: string;
  code: string;
  first_name: string;
  last_name: string;
  gender: string;
  nik: string | null;
  nip: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  village_id: string | null;
  zip_code: string | null;
  photo: string | null;
  marital_status: string;
  job_id: string | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: RoleApiData[];
  };
}

// Updated GetEmployeeByIdResponse to match actual API structure
interface GetEmployeeByIdResponse {
  message: string;
  data: StaffDetailResponse;
}

// For list response - actual structure
interface GetEmployeesRawResponse {
  message: string;
  status: number;
  data: StaffInListResponse[];
}

export interface CreateUpdateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  code: string;
  nik?: string;
  phone?: string;
  address?: string;
  zip_code?: string;
  username: string;
  password?: string;
  password_confirmation?: string;
  photo?: string;
}

export const employeeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<StaffInListResponse[], void>({
      query: () => `main/staff`,
      transformResponse: (response: GetEmployeesRawResponse) => response.data,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    getEmployeeById: builder.query<GetEmployeeByIdResponse, number>({
      query: (id) => `main/staff/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<GetEmployeeByIdResponse, CreateUpdateEmployeeRequest>({
      query: (newEmployee) => ({
        url: 'main/staff',
        method: 'POST',
        body: newEmployee,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<GetEmployeeByIdResponse, { id: number; data: CreateUpdateEmployeeRequest }>({
      query: ({ id, data }) => ({
        url: `main/staff/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    importEmployee: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: 'main/staff/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    checkNik: builder.query<{ data: any }, { nik: string }>({
      query: (body) => ({
        url: 'main/staff/check-nik',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useImportEmployeeMutation,
  useLazyCheckNikQuery,
} = employeeApi;