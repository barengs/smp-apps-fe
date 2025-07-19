import { smpApi } from '../baseApi';

// Define API response structures
interface RoleApiData {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeNestedData { // New interface for the nested employee object
  first_name: string;
  last_name: string;
}

interface EmployeeApiData { // Structure for the list of employees
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

interface EmployeeDetailApiData { // New interface for single employee detail
  id: number;
  user_id: number;
  code: string;
  first_name: string;
  last_name: string;
  nik: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  photo: string;
  created_at: string;
  updated_at: string;
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
    getEmployeeById: builder.query<EmployeeDetailApiData, number>({ // New endpoint for single employee
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
  useGetEmployeeByIdQuery, // Export the new hook
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;