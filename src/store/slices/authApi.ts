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

export const authApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userInfo) => ({
        url: 'register',
        method: 'POST',
        body: userInfo,
      }),
      invalidatesTags: ['User'],
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
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<{ token: string }, void>({
        query: () => ({
            url: 'refresh',
            method: 'POST',
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
} = authApi;