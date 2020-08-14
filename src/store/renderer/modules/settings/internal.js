import { modes } from '@/store/renderer/global';
import router from '@/common/huawei-router-api';

const smsTypes = router.sms.types;

export default {
  state: {
    general: {
      routerUrl: 'http://192.168.1.1',
      username: '',
      password: '',
      rememberLoginDetails: true, // FIXME: Use this
      defaultMode: modes.ADMIN,
    },
    sms: {
      hideSimBoxes: true,
      confirmDialogsToShow: ['delete', 'import'],
      typeIcons: {
        [smsTypes.RECHARGE]: { pack: 'fa', id: 'bolt' },
        [smsTypes.DATA]: { pack: 'fa', id: 'area-chart' },
        [smsTypes.DATA_PERCENT]: { pack: 'fa', id: 'pie-chart' },
        [smsTypes.ACTIVATED]: { pack: 'fa', id: 'lightbulb-o' },
        [smsTypes.DEPLETED]: { pack: 'fa', id: 'exclamation' },
        [smsTypes.AD]: { pack: 'fa', id: 'bullhorn' },
      },
    },
  },
};
