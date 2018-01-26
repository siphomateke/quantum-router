<template>
  <div class="page-content">
    <template v-if="adminMode">
      <b-tabs type="is-boxed" expanded>
        <b-tab-item :label="this.$i18n('sms_box_inbox')">
          <sms-box :box-type="boxTypes.INBOX"></sms-box>
        </b-tab-item>
        <b-tab-item :label="this.$i18n('sms_box_sent')">
          <sms-box :box-type="boxTypes.SENT"></sms-box>
        </b-tab-item>
        <b-tab-item :label="this.$i18n('sms_box_draft')">
          <sms-box :box-type="boxTypes.DRAFT"></sms-box>
        </b-tab-item>
      </b-tabs>
    </template>
    <template v-else>
      <div class="box">
        <b-message type="is-info" has-icon>
          {{ 'sms_admin_only' | $i18n}}
        </b-message>
      </div>
    </template>
  </div>
</template>

<script>
import SmsBox from '@/components/sms/SmsBox.vue';
import router from '@/router';
import {modes} from '@/store';

export default {
  components: {
    'sms-box': SmsBox,
  },
  computed: {
    boxTypes() {
      return router.sms.boxTypes;
    },
    adminMode() {
      return this.$store.state.mode === modes.ADMIN;
    },
  },
};
</script>
