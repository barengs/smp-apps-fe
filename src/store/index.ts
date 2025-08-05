import { configureStore } from '@reduxjs/toolkit';
import { smpApi } from './baseApi'; // Import baseApi
import authReducer from './slices/authSlice'; // Import auth reducer

// Import slices to ensure endpoints are injected and available for reducer/middleware
// Cukup import saja, tidak perlu mendaftarkan reducer/middleware mereka secara individual
// karena mereka sudah di-inject ke smpApi.
import './slices/authApi';
import './slices/roleApi';
import './slices/santriApi';
import './slices/employeeApi';
import './slices/permissionApi';
import './slices/studentApi';
import './slices/parentApi';
import './slices/dashboardApi';
import './slices/provinceApi';
import './slices/cityApi';
import './slices/districtApi';
import './slices/villageApi';
import './slices/programApi';
import './slices/tahunAjaranApi';
import './slices/hostelApi';
import './slices/educationApi';
import './slices/classroomApi';
import './slices/classGroupApi';
import './slices/menuApi';
import './slices/pekerjaanApi';
import './slices/beritaApi';
import './slices/studyApi';
import './slices/calonSantriApi';
import './slices/bankApi';
import './slices/educationGroupApi';
import './slices/activityApi';

export const store = configureStore({
  reducer: {
    [smpApi.reducerPath]: smpApi.reducer, // Ini sudah mencakup semua reducer dari endpoint yang di-inject
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      smpApi.middleware, // Ini sudah mencakup semua middleware dari endpoint yang di-inject
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {smpApi: SmpApiState, ...}
export type AppDispatch = typeof store.dispatch;