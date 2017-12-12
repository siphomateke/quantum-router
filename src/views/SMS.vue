<template>
  <div class="box">
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
  </div>
</template>

<script>
import SmsBox from '@/components/sms/SmsBox.vue';
import {SmsBoxTypes} from '@/chrome/router.js';

export default {
  components: {
    'sms-box': SmsBox,
  },
  data() {
    return {

    };
  },
  computed: {
    boxTypes() {
      return SmsBoxTypes;
    },
  },
};
</script>
