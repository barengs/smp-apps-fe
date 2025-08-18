import { smpApi } from '../baseApi';

// --- API Response Type ---
export interface ControlPanelSettings {
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
      query: () => 'control-panel',
      providesTags: ['ControlPanelSettings'],
    }),
    updateControlPanelSettings: builder.mutation<ControlPanelSettings, Partial<ControlPanelSettings>>({
      query: (settings) => ({
        url: 'control-panel',
        method: 'POST', // Backend uses POST for updates
        body: settings,
      }),
      invalidatesTags: ['ControlPanelSettings'],
    }),
  }),
});

export const { useGetControlPanelSettingsQuery, useUpdateControlPanelSettingsMutation } = controlPanelApi;