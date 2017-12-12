<template>
  <div class="box">
    <template v-if="adminMode">
    <b-tabs type="is-boxed" expanded>
      <b-tab-item label="Inbox">
        <sms-box :box-type="boxTypes.INBOX"></sms-box>
      </b-tab-item>
      <b-tab-item label="Outbox">
        <sms-box :box-type="boxTypes.SENT"></sms-box>
      </b-tab-item>
      <b-tab-item label="Drafts">
        <sms-box :box-type="boxTypes.DRAFT"></sms-box>
      </b-tab-item>
    </b-tabs>
    </template>
    <template v-else>
      <b-message type="is-info" has-icon>
        You must have administrator access to view SMS messages
      </b-message>
    </template>
  </div>
</template>

<script>
import SmsBox from '@/components/sms/SmsBox.vue';
import {SmsBoxTypes} from '@/chrome/router.js';
import {modes} from '@/store';

export default {
  components: {
    'sms-box': SmsBox,
  },
  computed: {
    boxTypes() {
      return SmsBoxTypes;
    },
    adminMode() {
      return this.$store.state.mode === modes.ADMIN;
    },
  },
};
</script>
