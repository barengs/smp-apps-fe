import { smpApi } from '../baseApi';

// Define API response structures
interface RoleApiData {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeNestedData { // This interface is still used for the list of employees (getEmployees)
  first_name: string;
  last_name: string;
}

interface EmployeeApiData { // Structure for the list of employees (from getEmployees)
  id: number;
  employee: EmployeeNestedData; // Nested employee object
  email: string;
  roles: RoleApiData[]; // Array of role objects
  created_at: string;
  updated_at: string;
}

interface GetEmployeesResponse {
  message: string;
  data: EmployeeApiData[];
}

// CORRECTED: Interface for single employee detail (from getEmployeeById)
// Based on the latest structure provided by the user, employee details are flat
// and roles are not included in this specific detail response.
interface EmployeeDetailApiData {
  id: number;
  user_id: number;
  code: string;
  first_name: string; // Now directly on data
  last_name: string;  // Now directly on data
  nik: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  photo: string;
  created_at: string;
  updated_at: string;
  // Note: 'roles' array is not present in the provided detail API structure for this endpoint
}

export interface CreateUpdateEmployeeRequest {
  first_name: string; // Still flat for request
  last_name: string;  // Still flat for request
  email: string;
  role_ids: number[];
}

export const employeeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<GetEmployeesResponse, void>({
      query: () => 'employee',
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query<EmployeeDetailApiData, number>({ // Updated return type
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