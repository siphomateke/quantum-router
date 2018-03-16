import router from 'huawei-router-api/browser';

const smsTypes = router.sms.types;

export default {
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
        return 'data_percent';
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
      return this.$i18n('sms_types_'+this.getSmsTypeCode(type));
    },
    // TODO: Add icon customization to settings
    getSmsTypeIcon(type) {
      switch (type) {
      case smsTypes.RECHARGE:
        return 'bolt';
      case smsTypes.DATA:
        return 'area-chart';
      case smsTypes.DATA_PERCENT:
        return 'pie-chart';
      case smsTypes.ACTIVATED:
        return 'lightbulb-o';
      case smsTypes.DEPLETED:
        return 'exclamation';
      case smsTypes.AD:
        return 'bullhorn';
      default:
        return '';
      }
    },
  },
};
