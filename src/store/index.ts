import { configureStore } from '@reduxjs/toolkit';
import { smpApi } from './baseApi'; // Import baseApi
import authReducer from './slices/authSlice'; // Import auth reducer

// Import slices to ensure endpoints are injected
import './slices/authApi'; // Import the new auth slice
import './slices/roleApi';
import './slices/santriApi';
import './slices/employeeApi';
import './slices/permissionApi';
import './slices/studentApi';
import './slices/parentApi';
import './slices/dashboardApi'; // Import the new dashboard slice
import './slices/provinceApi';
import './slices/cityApi';
import './slices/districtApi';
import './slices/villageApi'; // Import the new village slice
import './slices/programApi'; // Import the new program slice
import './slices/tahunAjaranApi';
import './slices/hostelApi';
import './slices/educationApi';
import './slices/classroomApi';
import './slices/classGroupApi';
import './slices/menuApi'; // Import the new menu slice
import './slices/pekerjaanApi'; // Import the new pekerjaan slice
import './slices/beritaApi'; // Import the new berita slice
import './slices/studyApi'; // Import the new study slice

export const store = configureStore({
  reducer: {
    [smpApi.reducerPath]: smpApi.reducer,
    auth: authReducer,
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