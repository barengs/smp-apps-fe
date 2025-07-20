import { smpApi } from '../baseApi';

// Define API response structures
interface RoleApiData {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface DataApi {
  data: any[];
}

interface EmployeeNestedData {
  first_name: string;
  last_name: string;
}

interface EmployeeApiData {
  id: number;
  employee: EmployeeNestedData;
  email: string;
  roles: RoleApiData[];
  created_at: string;
  updated_at: string;
}

interface GetEmployeesResponse {
  message: string;
  data: EmployeeApiData[];
}

// --- Types for Single Employee Detail ---

interface EmployeeDetailNestedDataForDetail {
  first_name: string;
  last_name: string;
  code: string;
  nik: string;
  phone: string;
  email: string;
  address: string;
  zip_code: string;
  photo: string;
}

interface RoleNameOnly {
  name: string;
}

// This is the object inside the "data" property of the response
interface EmployeeDetailData {
  id: number;
  user_id: number;
  code: string;
  created_at: string;
  updated_at: string;
  employee: EmployeeDetailNestedDataForDetail;
  roles: RoleNameOnly[];
}

// This is the full response from the API
interface GetEmployeeByIdResponse {
  message: string;
  data: EmployeeDetailData;
}

export interface CreateUpdateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  role_ids: number[];
}

export const employeeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<GetEmployeesResponse, void>({
      query: () => 'employee',
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query<GetEmployeeByIdResponse, number>({
      query: (id) => `employee/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<EmployeeApiData, CreateUpdateEmployeeRequest>({
      query: (newEmployee) => ({
        url: 'employee',
        method: 'POST',
        body: newEmployee,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<EmployeeApiData, { id: number; data: CreateUpdateEmployeeRequest }>({
      query: ({ id, data }) => ({
        url: `employee/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Employee'],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `employee/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;