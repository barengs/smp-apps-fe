import { smpApi } from '../baseApi';
import { CreateUpdateEmployeeRequest } from './employeeApi'; // Import CreateUpdateEmployeeRequest

// --- Interfaces ---
export interface User { // Menambahkan 'export' di sini
  id: number;
  name: string;
  email: string;
  username: string;
  roles: { name: string }[];
  profile?: { // Menambahkan properti profile
    id: number;
    user_id: number;
    code: string;
    first_name: string;
    last_name: string;
    nik: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    zip_code: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
  };
  employee?: { // Menambahkan properti employee sesuai struktur JSON yang diberikan
    id: number;
    user_id: number;
    code: string;
    first_name: string;
    last_name: string;
    nik: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    zip_code: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
  };
}

// Struktur AuthResponse disesuaikan dengan respons API yang diberikan
export interface AuthResponse { // Export AuthResponse for use in authSlice
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  login: string; // Mengubah 'email' menjadi 'login'
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface ProfileResponse {
    message: string;
    data: User;
}

interface LogoutResponse {
    message: string;
}

// New interfaces for detailed user profile
interface ProfileData {
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  photo: string; // Assuming URL to photo
}

export interface GetProfileDetailsResponse { // Export this interface
  data: User; // Changed to User to get the user ID directly
}

// New interfaces for forgot password
export interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

// New interfaces for change password
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ChangePasswordResponse {
  message: string;
}

export interface UpdateProfileResponse { // Export this interface
    message: string;
    data: User;
}

export const authApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Profile'], // Invalidate Profile tag on login
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userInfo) => ({
        url: 'register',
        method: 'POST',
        body: userInfo,
      }),
      invalidatesTags: ['User', 'Profile'], // Invalidate Profile tag on register
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => 'profile',
      providesTags: ['User'],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Profile'], // Invalidate Profile tag on logout
    }),
    refreshToken: builder.mutation<{ access_token: string; expires_in: number }, void>({
        query: () => ({
            url: 'refresh',
            method: 'POST',
        }),
    }),
    getProfileDetails: builder.query<GetProfileDetailsResponse, void>({
      query: () => 'profile', // Assuming the same /profile endpoint returns detailed data
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<UpdateProfileResponse, { id: number; data: CreateUpdateEmployeeRequest }>({
      query: ({ id, data }) => ({
        url: `employee/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: 'forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: 'change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileDetailsQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation, // Export the new hook
} = authApi;