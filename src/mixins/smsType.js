import { mapState } from 'vuex';
import router from 'huawei-router-api/browser';

const smsTypes = router.sms.types;

export default {
  computed: {
    ...mapState({
      smsTypeIcons: state => state.settings.internal.sms.typeIcons,
    }),
  },
  methods: {
    /**
     * Rather than directly using the values of the sms types
     * we generate custom strings to use for i18n in case huawei-router-api changes
     * @param {*} type
     * @return {string}
     */
    getSmsTypeCode(type) {
      switch (type) {
        case smsTypes.RECHARGE:
          return 'recharge';
        case smsTypes.DATA:
          return 'data';
        case smsTypes.DATA_PERCENT:
          return 'dataPercent';
        case smsTypes.ACTIVATED:
          return 'activated';
        case smsTypes.DEPLETED:
          return 'depleted';
        case smsTypes.AD:
          return 'ad';
        default:
          return '';
      }
    },
    getSmsTypeName(type) {
      return this.$i18n(`sms.messageTypes.${this.getSmsTypeCode(type)}`);
    },
  },
};
