<template>
  <div class="page-content">
    <template v-if="adminMode">
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
          :label="tab.label">

          <sms-box
            :bus="buses[idx]"
            :box-type="tab.boxType"
            @update:checked-rows="val => updateCheckedRows(val, idx)"
          ></sms-box>
        </b-tab-item>
      </b-tabs>
      <b-modal :active.sync="showNewMessageDialog" has-modal-card>
        <sms-dialog></sms-dialog>
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
    const tabData = {};
    const buses = [];
    for (let i=0; i<tabs.length; i++) {
      tabData[i] = {
        checkedRows: [],
      };
      buses[i] = new Vue();
    }
    return {
      tabs,
      tabData,
      currentTab: 0,
      buses,
      bus: new Vue(),
      showNewMessageDialog: false,
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
  },
  computed: {
    boxTypes() {
      return router.sms.boxTypes;
    },
    boxType() {
      return this.tabs[this.currentTab].boxType;
    },
    adminMode() {
      return this.$store.state.mode === modes.ADMIN;
    },
    isInbox() {
      return this.boxType === router.sms.boxTypes.INBOX;
    },
    checkedRows() {
      return this.tabData[this.currentTab].checkedRows;
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
      this.tabData[idx].checkedRows = val;
    },
    newMessage() {
      this.showNewMessageDialog = true;
    },
    import() {
      // TODO: Implement import
    },
  },
};
</script>

<style>
  .sms-action-wrapper{
    padding: 1rem;
  }
</style>
