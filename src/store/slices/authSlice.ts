import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { RootState } from '../index';
import { logOut, updateToken } from '../authActions'; // Import from new file

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
    // logOut dan updateToken dipindahkan ke extraReducers
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(logOut, (state) => { // Handle logOut action
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addCase(updateToken, (state, { payload }) => { // Handle updateToken action
        state.token = payload;
        state.isAuthenticated = !!payload;
        if (payload) {
          localStorage.setItem('token', payload);
        } else {
          localStorage.removeItem('token');
        }
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        const { access_token, user } = payload;
        state.token = access_token;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
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
        // Payload dari refreshToken mutation adalah { access_token: string }
        state.token = payload.access_token; // Menggunakan access_token
        localStorage.setItem('token', payload.access_token);
      });
  },
});

export const { setCredentials } = authSlice.actions; // Hanya setCredentials yang tersisa

export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;