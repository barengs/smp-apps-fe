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
  code: string; // Added code field
  nik: string; // Added nik field
  phone: string; // Added phone field
  address: string; // Added address field
  zip_code: string; // Added zip_code field
  email: string;
  photo: string;
}

interface EmployeeApiData {
  id: number;
  employee: EmployeeNestedData;
  email: string;
  roles: RoleApiData[];
  created_at: string;
  updated_at: string;
  username: string; // Ditambahkan: properti username
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
  username: string; // Added username to detail data
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
  roles: string[]; // Diubah dari role_ids: number[] menjadi roles: string[]
  code: string; // Added code for creation
  nik?: string; // Added nik
  phone?: string; // Added phone
  address?: string; // Added address
  zip_code?: string; // Added zip_code
  username: string; // Added username
  password?: string; // Added password (optional for updates, required for create)
  photo?: string; // Ditambahkan: untuk data gambar base64
}

export const employeeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<GetEmployeesResponse, void>({
      query: () => 'staff', // Changed from 'employee' to 'staff'
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query<GetEmployeeByIdResponse, number>({
      query: (id) => `staff/${id}`, // Changed from 'employee' to 'staff'
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<EmployeeApiData, CreateUpdateEmployeeRequest>({
      query: (newEmployee) => ({
        url: 'staff', // Changed from 'employee' to 'staff'
        method: 'POST',
        body: newEmployee,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<EmployeeApiData, { id: number; data: CreateUpdateEmployeeRequest }>({
      query: ({ id, data }) => ({
        url: `staff/${id}`, // Changed from 'employee' to 'staff'
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Employee'],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `staff/${id}`, // Changed from 'employee' to 'staff'
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
    importEmployee: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: 'staff/import', // Changed from 'employee/import' to 'staff/import'
        method: 'POST',
        body: formData,
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
  useImportEmployeeMutation,
} = employeeApi;