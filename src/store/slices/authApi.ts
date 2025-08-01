import { smpApi } from '../baseApi';

// --- Interfaces ---
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  roles: { name: string }[];
}

// Struktur AuthResponse disesuaikan dengan respons API yang diberikan
interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
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

interface GetProfileDetailsResponse {
  data: {
    profile: ProfileData;
  };
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
    refreshToken: builder.mutation<{ access_token: string }, void>({
        query: () => ({
            url: 'refresh',
            method: 'POST',
        }),
    }),
    getProfileDetails: builder.query<GetProfileDetailsResponse, void>({
      query: () => 'profile', // Assuming the same /profile endpoint returns detailed data
      providesTags: ['Profile'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileDetailsQuery, // Export the new hook
} = authApi;