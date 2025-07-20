import { configureStore } from '@reduxjs/toolkit';
import { smpApi } from './baseApi'; // Import baseApi

// Import slices to ensure endpoints are injected
import './slices/roleApi';
import './slices/santriApi';
import './slices/employeeApi';
import './slices/permissionApi';
import './slices/studentApi';
import './slices/parentApi';
import './slices/dashboardApi'; // Import the new dashboard slice

export const store = configureStore({
  reducer: {
    [smpApi.reducerPath]: smpApi.reducer,
    // Anda bisa menambahkan reducer lain di sini jika diperlukan
  },
  // Menambahkan middleware API untuk mengaktifkan fitur caching, invalidasi, polling, dll.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(smpApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {smpApi: SmpApiState, ...}
export type AppDispatch = typeof store.dispatch;