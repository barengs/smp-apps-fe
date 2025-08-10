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
    // Add mutations for update if needed later
  }),
});

export const { useGetControlPanelSettingsQuery } = controlPanelApi;