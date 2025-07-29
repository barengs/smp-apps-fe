import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { RootState } from '../index';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  roles: { name: string }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Coba ambil token dari localStorage saat inisialisasi
const token = localStorage.getItem('token');
const userString = localStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;

const initialState: AuthState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials: (
        state,
        { payload }: PayloadAction<{ user: User; token: string }>
      ) => {
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      },
    updateToken: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
      state.isAuthenticated = !!payload;
      if (payload) {
        localStorage.setItem('token', payload);
      } else {
        localStorage.removeItem('token');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        // Mengambil access_token dan user langsung dari payload
        const { access_token, user } = payload;
        state.token = access_token;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        // Mengambil access_token dan user langsung dari payload
        const { access_token, user } = payload;
        state.token = access_token;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, { payload }) => {
        // Ketika refresh token berhasil, perbarui token di state
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      });
  },
});

export const { logOut, setCredentials, updateToken } = authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;