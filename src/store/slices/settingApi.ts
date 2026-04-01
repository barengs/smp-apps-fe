import { bankSmpApi } from '../bankBaseApi';
import { AppSetting, UpdateSettingsRequest } from '@/types/keuangan';

export const settingApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<{ [group: string]: AppSetting[] }, void>({
      query: () => 'master/setting',
      providesTags: ['Setting'],
      transformResponse: (response: { data: { [group: string]: AppSetting[] } }) => response.data,
    }),
    updateSettings: builder.mutation<{ status: string, message: string, updated: string[] }, UpdateSettingsRequest>({
      query: (data) => ({
        url: 'master/setting',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingApi;
