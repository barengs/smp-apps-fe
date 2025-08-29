import { configureStore } from '@reduxjs/toolkit';
import { smpApi } from './baseApi';
import authReducer from './slices/authSlice';

// These imports are crucial to run the `injectEndpoints` code.
// They don't need to be individually added to the store config
// if they are injected into smpApi.
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
// import { bankApi } from './slices/bankApi'; // bankApi is a separate API, so we need its export. -> Dihapus karena sudah di-inject
import './slices/educationGroupApi';
import './slices/activityApi';
import './slices/controlPanelApi';
import './slices/produkBankApi';
import './slices/coaApi';
import './slices/accountApi';
import './slices/roomApi'; // Register the new room API slice
import './slices/internshipApi'; // Register the new internship API slice
import './slices/partnerApi'; // Register the new partner API slice
import './slices/supervisorApi'; // Register the new supervisor API slice
import './slices/bankApi'; // Pastikan bankApi diimpor untuk menjalankan injectEndpoints

export const store = configureStore({
  reducer: {
    // Register the main API reducer. This handles all injected endpoints.
    [smpApi.reducerPath]: smpApi.reducer,
    // [bankApi.reducerPath]: bankApi.reducer, // Perbaikan: Dihapus karena duplikasi reducerPath
    // Register the auth slice reducer.
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // Add the middleware for the main API and the separate bank API.
      smpApi.middleware,
      // bankApi.middleware // Perbaikan: Dihapus karena middleware sudah ditangani oleh smpApi
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {smpApi: SmpApiState, ...}
export type AppDispatch = typeof store.dispatch;

// Define the types for the API slices
export type StudentStatistics = any;
export type ProdukBank = any;
export type Coa = any;
export type TransactionType = any;
export type Account = any;