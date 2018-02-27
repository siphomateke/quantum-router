<template>
  <div class="page-content">
    <template v-if="$adminMode">
      <div class="sms-action-wrapper">
        <sms-actions
          :bus="bus"
          :checked-rows="checkedRows"
          :hidden="{
            'markAsRead': !isInbox,
          }"
          :disabled="{
            'clearChecked': checkedRows.length === 0,
            'delete': checkedRows.length === 0,
            'markAsRead': checkedRows.length === 0,
            'import': true,
          }">
        </sms-actions>
      </div>
      <b-tabs type="is-boxed" expanded @change="changedTab">
        <b-tab-item
          v-for="(tab, idx) in tabs" :key="idx"
          :label="tab.label+tab.status">

          <sms-box
            :bus="buses[idx]"
            :box-type="tab.boxType"
            @update:checked-rows="val => updateCheckedRows(val, idx)"
            @edit="editMessage"
          ></sms-box>
        </b-tab-item>
      </b-tabs>
      <b-modal ref="smsDialogModal" :active.sync="showSmsDialog" has-modal-card>
        <sms-dialog
          :index.sync="dialog.index"
          :numbers.sync="dialog.numbers"
          :content.sync="dialog.content"
          @save="smsDialogSave"
          @send="smsDialogSend"
          @cancel="smsDialogClose"
        ></sms-dialog>
      </b-modal>
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
import Vue from 'vue';
import SmsActions from '@/components/sms/SmsActions.vue';
import SmsBox from '@/components/sms/SmsBox.vue';
import SmsDialog from '@/components/sms/SmsDialog.vue';
import router from 'huawei-router-api/browser';
import {modes} from '@/store';

const boxTypes = router.sms.boxTypes;

export default {
  components: {
    SmsActions,
    SmsBox,
    SmsDialog,
  },
  data() {
    const tabs = [
      {boxType: boxTypes.INBOX, label: this.$i18n('sms_box_inbox')},
      {boxType: boxTypes.SENT, label: this.$i18n('sms_box_sent')},
      {boxType: boxTypes.DRAFT, label: this.$i18n('sms_box_draft')},
    ];
    const buses = [];
    for (let i=0; i<tabs.length; i++) {
      tabs[i].status = '';
      tabs[i].checkedRows = [];
      buses[i] = new Vue();
    }
    return {
      tabs,
      currentTab: 0,
      buses,
      bus: new Vue(),
      showSmsDialog: false,
      dialog: {
        index: -1,
        numbers: [],
        content: '',
      },
    };
  },
  mounted() {
    // Redirect these events to the active tab
    const eventsToRedirect = [
      'sms-actions:clear-checked',
      'sms-actions:delete',
      'sms-actions:mark-as-read',
    ];
    for (const event of eventsToRedirect) {
      this.bus.$on(event, data => {
        this.currentBus.$emit(event, data);
      });
    }

    this.bus.$on('sms-actions:new', this.newMessage);
    this.bus.$on('sms-actions:import', this.import);

    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
  },
  computed: {
    boxTypes() {
      return router.sms.boxTypes;
    },
    boxType() {
      return this.tabs[this.currentTab].boxType;
    },
    isInbox() {
      return this.boxType === router.sms.boxTypes.INBOX;
    },
    checkedRows() {
      return this.tabs[this.currentTab].checkedRows;
    },
    currentBus() {
      return this.buses[this.currentTab];
    },
  },
  methods: {
    changedTab(idx) {
      this.currentTab = idx;
    },
    updateCheckedRows(val, idx) {
      this.tabs[idx].checkedRows = val;
    },
    getTabIndexByBoxType(type) {
      return this.tabs.findIndex(tab => tab.boxType === type);
    },
    getTabByBoxType(type) {
      return this.tabs[this.getTabIndexByBoxType(type)];
    },
    async refreshAdmin() {
      // TODO: Refresh every once in a while
      const smsData = await router.sms.getSmsCount();
      const separator = '\xa0 | \xa0';
      this.getTabByBoxType(boxTypes.INBOX).status = separator+smsData.LocalInbox;
      this.getTabByBoxType(boxTypes.SENT).status = separator+smsData.LocalOutbox;
      this.getTabByBoxType(boxTypes.DRAFT).status = separator+smsData.LocalDraft;
    },

    /* SMS dialog */
    smsDialogClose() {
      this.$refs['smsDialogModal'].close();
    },
    smsDialogSave() {
      this.smsDialogClose();
    },
    smsDialogSend() {
      this.smsDialogClose();
    },
    newMessage() {
      this.dialog.index = -1;
      this.dialog.numbers = [];
      this.dialog.content = '';
      this.showSmsDialog = true;
    },
    editMessage(message) {
      this.dialog.index = message.index;
      this.dialog.numbers = message.number.split(';');
      this.dialog.content = message.content;
      this.showSmsDialog = true;
    },

    import() {
      // TODO: Implement import
    },
  },
};
</script>

<style lang="scss" scoped>
  .sms-action-wrapper{
    padding: 1rem;
  }
</style>
