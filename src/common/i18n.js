let i18n = null;

if (process.type === 'renderer') {
  i18n = require('../platform/i18n').default;
} else {
  i18n = require('../electron/i18n').default;
}

export default i18n;
