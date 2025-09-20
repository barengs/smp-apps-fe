import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { smpApi } from './baseApi';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import all API slices
import { authApi } from './slices/authApi';
import { employeeApi } from './slices/employeeApi';
import { permissionApi } from './slices/permissionApi';
import { roleApi } from './slices/roleApi';
import { provinceApi } from './slices/provinceApi';
import { cityApi } from './slices/cityApi';
import { districtApi } from './slices/districtApi';
import { villageApi } from './slices/villageApi';
import { programApi } from './slices/programApi';
import { tahunAjaranApi } from './slices/tahunAjaranApi';
import { hostelApi } from './slices/hostelApi';
import { educationApi } from './slices/educationApi';
import { classroomApi } from './slices/classroomApi';
import { classGroupApi } from './slices/classGroupApi';
import { educationGroupApi } from './slices/educationGroupApi';
import { studyApi } from './slices/studyApi';
import { activityApi } from './slices/activityApi';
import { santriApi } from './slices/santriApi';
import { parentApi } from './slices/parentApi';
import { dashboardApi } from './slices/dashboardApi';
import { pekerjaanApi } from './slices/pekerjaanApi';
import { beritaApi } from './slices/beritaApi';
import { controlPanelApi } from './slices/controlPanelApi';
import { internshipApi } from './slices/internshipApi';
import { calonSantriApi } from './slices/calonSantriApi';
import { supervisorApi } from './slices/supervisorApi';
import { bankApi } from './slices/bankApi';
import { produkBankApi } from './slices/produkBankApi';
import { coaApi } from './slices/coaApi';
import { transactionTypeApi } from './slices/transactionTypeApi';
import { accountApi } from './slices/accountApi';
import { roomApi } from './slices/roomApi';
import { teacherApi } from './slices/teacherApi';
import { studentClassApi } from './slices/studentClassApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [smpApi.reducerPath]: smpApi.reducer,
    // All other API slices are already included in smpApi.reducer via injectEndpoints
    // No need to list them individually here.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(smpApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;