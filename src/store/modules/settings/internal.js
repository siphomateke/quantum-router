import {modes} from '@/store/global.js';
import router from 'huawei-router-api/browser';

const smsTypes = router.sms.types;

export default {
  // FIXME: Actually use these
  state: {
    general: {
      defaultMode: modes.ADMIN,
      rememberPassword: true,
    },
    sms: {
      hideSimBoxes: true,
      confirmDialogsToShow: ['delete', 'import'],
      typeIcons: {
        [smsTypes.RECHARGE]: {pack: 'fa', id: 'bolt'},
        [smsTypes.DATA]: {pack: 'fa', id: 'area-chart'},
        [smsTypes.DATA_PERCENT]: {pack: 'fa', id: 'pie-chart'},
        [smsTypes.ACTIVATED]: {pack: 'fa', id: 'lightbulb-o'},
        [smsTypes.DEPLETED]: {pack: 'fa', id: 'exclamation'},
        [smsTypes.AD]: {pack: 'fa', id: 'bullhorn'},
      },
    },
  },
};
