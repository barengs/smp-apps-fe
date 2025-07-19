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
  data: [];
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

// CORRECTED AGAIN: Interface for single employee detail (from getEmployeeById)
// Based on the latest clarification: nested 'employee' object and 'roles' array with 'name' only.
interface EmployeeDetailNestedDataForDetail { // Specific for the detail endpoint's nested employee
  first_name: string;
  last_name: string;
  code: string;
  nik: string;
  phone: string;
  email: string; // Email is now nested inside employee for detail endpoint
  address: string;
  zip_code: string;
  photo: string;
}

interface RoleNameOnly { // For roles array in detail endpoint, only 'name' is provided
  name: string;
}

interface EmployeeDetailApiData { // Corrected interface for single employee detail (from getEmployeeById)
  id: number;
  data: [];
  user_id: number;
  code: string;
  created_at: string;
  updated_at: string;
  employee: EmployeeDetailNestedDataForDetail; // Nested employee object
  roles: RoleNameOnly[]; // Array of role objects with only 'name'
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
        method: 'DELETE', // Fixed: Changed backtick to single quote
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