let router = null;
if (process.type === 'renderer') {
  router = require('huawei-router-api/dist/browser.cjs').default;
} else {
  router = require('huawei-router-api').default;
}

export default router;
