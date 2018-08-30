import i18next from 'i18next';
import LanguageDetector from 'i18next-electron-language-detector';
import Backend from 'i18next-node-fs-backend';
import * as path from 'path';
import defaultOptions from '../config/i18next';

i18next.use(Backend).use(LanguageDetector);

/** @type {i18next.InitOptions} */
let options = {
  debug: true,
  backend: {
    loadPath: path.join(__static, 'locales', '{{lng}}', '{{ns}}.json'),
  },
};
options = Object.assign(defaultOptions, options);

if (!i18next.isInitialized) {
  i18next.init(options);
}

export function getResources() {
  let namespaces;
  if (Array.isArray(options.ns)) {
    namespaces = options.ns;
  } else {
    namespaces = [options.ns];
  }
  const resources = {};
  for (const lng of i18next.languages) {
    resources[lng] = {};
    for (const namespace of namespaces) {
      const bundle = i18next.getResourceBundle(lng, namespace);
      resources[lng][namespace] = bundle;
    }
  }
  return resources;
}

export function getCurrentLanguageData() {
  return {
    lng: i18next.language,
    resources: getResources(),
  };
}

export default i18next;
