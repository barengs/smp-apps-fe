import { useEffect } from 'react';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';
import { useTheme } from './theme-provider';
import { useTranslation } from 'react-i18next';

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
      i18n.changeLanguage(settings.app_language);
    }
  }, [settings, setTheme, i18n]);

  return null; // This component does not render anything
};

export default DynamicAppConfig;