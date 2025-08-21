import { useEffect } from 'react';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';
import { useTheme } from './theme-provider';
import { useTranslation } from 'react-i18next';

const languageMapping: { [key: string]: string } = {
  indonesia: 'id',
  english: 'en',
  arabic: 'ar',
};

const DynamicAppConfig = () => {
  const { data: settings } = useGetControlPanelSettingsQuery();
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (settings) {
      // Set Favicon
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon && settings.app_favicon) {
        favicon.href = settings.app_favicon;
      }

      // Set Theme and Language
      setTheme(settings.app_theme);
      const i18nCode = languageMapping[settings.app_language];
      if (i18nCode) {
        i18n.changeLanguage(i18nCode);
      }
    }
  }, [settings, setTheme, i18n]);

  return null; // This component does not render anything
};

export default DynamicAppConfig;