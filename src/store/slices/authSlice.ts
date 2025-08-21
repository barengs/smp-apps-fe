import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, AuthResponse, User } from './authApi'; // Import AuthResponse and User
import { RootState } from '../index';
import { logOut, updateToken } from '../authActions';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  expirationTime: number | null; // Waktu kedaluwarsa dalam milidetik
}

// Ambil data dari localStorage saat inisialisasi
const token = localStorage.getItem('token');
const userString = localStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;
const expirationTimeString = localStorage.getItem('expirationTime');
const expirationTime = expirationTimeString ? parseInt(expirationTimeString, 10) : null;

const initialState: AuthState = {
  user: user,
  token: token,
  isAuthenticated: !!token && !!expirationTime && expirationTime > Date.now(),
  expirationTime: expirationTime,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
        state,
        { payload }: PayloadAction<{ user: User; token: string; expires_in: number }>
      ) => {
        const expirationTime = Date.now() + payload.expires_in * 1000;
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        state.expirationTime = expirationTime;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
        localStorage.setItem('expirationTime', expirationTime.toString());
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logOut, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.expirationTime = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expirationTime');
      })
      .addCase(updateToken, (state, { payload }) => {
        state.token = payload;
        state.isAuthenticated = !!payload;
        if (payload) {
          localStorage.setItem('token', payload);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('expirationTime');
        }
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action: PayloadAction<AuthResponse>) => {
        const { access_token, user, expires_in } = action.payload;
        const expirationTime = Date.now() + expires_in * 1000;
        state.token = access_token;
        state.user = user;
        state.isAuthenticated = true;
        state.expirationTime = expirationTime;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expirationTime', expirationTime.toString());
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action: PayloadAction<AuthResponse>) => {
        const { access_token, user, expires_in } = action.payload;
        const expirationTime = Date.now() + expires_in * 1000;
        state.token = access_token;
        state.user = user;
        state.isAuthenticated = true;
        state.expirationTime = expirationTime;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expirationTime', expirationTime.toString());
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.expirationTime = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expirationTime');
      })
      .addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, action: PayloadAction<{ access_token: string; expires_in: number }>) => {
        const { access_token, expires_in } = action.payload;
        const expirationTime = Date.now() + expires_in * 1000;
        state.token = access_token;
        state.expirationTime = expirationTime;
        localStorage.setItem('token', access_token);
        localStorage.setItem('expirationTime', expirationTime.toString());
      });
  },
});

export const { setCredentials } = authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectExpirationTime = (state: RootState) => state.auth.expirationTime;