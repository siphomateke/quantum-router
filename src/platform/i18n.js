import defaultOptions from '@/config/i18next';
import { ipcRenderer } from 'electron';
import i18next from 'i18next';
import { memoize } from '@/utils';

if (!i18next.isInitialized) {
  i18next.init({
    fallbackLng: defaultOptions.fallbackLng,
    whitelist: defaultOptions.whitelist,
    ns: defaultOptions.ns,
    defaultNS: defaultOptions.defaultNS,
  });
}

function changeLanguage({ lng, resources }) {
  for (const lng of Object.keys(resources)) {
    const languageObject = resources[lng];
    for (const namespace of Object.keys(languageObject)) {
      const resource = languageObject[namespace];
      if (!i18next.hasResourceBundle(lng, namespace)) {
        i18next.addResourceBundle(lng, namespace, resource);
      }
    }
  }

  i18next.changeLanguage(lng);
}

ipcRenderer.on('language-changed', (event, message) => {
  changeLanguage(message);
});

const initialLanguageData = ipcRenderer.sendSync('get-initial-language-data');
changeLanguage(initialLanguageData);

export default {
  getMessage: memoize((key, ...args) => i18next.t(key, ...args)),
};
