import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../public/locales/en-US/translation.json';

const i18n = i18next.use(initReactI18next);

i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: en,
    },
  },
});

export default i18n;
