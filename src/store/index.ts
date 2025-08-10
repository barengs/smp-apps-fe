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
import { bankApi } from './slices/bankApi'; // bankApi is a separate API, so we need its export.
import './slices/educationGroupApi';
import './slices/activityApi';
import './slices/controlPanelApi'; // Import the new controlPanelApi

export const store = configureStore({
  reducer: {
    // Register the main API reducer. This handles all injected endpoints.
    [smpApi.reducerPath]: smpApi.reducer,
    // Register the separate bank API reducer.
    [bankApi.reducerPath]: bankApi.reducer,
    // Register the auth slice reducer.
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // Add the middleware for the main API and the separate bank API.
      smpApi.middleware,
      bankApi.middleware
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {smpApi: SmpApiState, ...}
export type AppDispatch = typeof store.dispatch;