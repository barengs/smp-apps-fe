import { smpApi } from '../baseApi';

// --- API Response Type ---
export interface ControlPanelSettings {
  id: string | number; // Menambahkan ID, diasumsikan ada di response
  app_name: string;
  app_version: string;
  app_description: string;
  app_logo: string | null;
  app_favicon: string | null;
  app_url: string;
  app_email: string;
  app_phone: string;
  app_address: string;
  is_maintenance_mode: boolean;
  maintenance_message: string | null;
  app_theme: 'light' | 'dark' | 'system';
  app_language: string;
}

export const controlPanelApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getControlPanelSettings: builder.query<ControlPanelSettings, void>({
      query: () => 'main/control-panel',
      providesTags: ['ControlPanelSettings'],
    }),
    updateControlPanelSettings: builder.mutation<ControlPanelSettings, { id: string | number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `main/control-panel/${id}`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ControlPanelSettings'],
    }),
  }),
});

export const { useGetControlPanelSettingsQuery, useUpdateControlPanelSettingsMutation } = controlPanelApi;