<template>
  <div class="page-content">
    <template v-if="$adminMode">
      <div class="sms-action-wrapper">
        <sms-actions
          :bus="bus"
          :checked-rows="selected"
          :hidden="{
            'markAsRead': !isInbox,
          }"
          :disabled="{
            'delete': selected.length === 0,
            'markAsRead': selected.length === 0,
            'import': !importEnabled,
          }"
          :selection-state="selectionState">
        </sms-actions>
      </div>
      <b-tabs type="is-boxed" expanded @change="changedTab">
        <b-tab-item
          v-for="(tab, idx) in tabs" :key="idx">

          <template slot="header">
            <b-icon :icon="tab.icon" size="is-small"/>
            <span>{{ tab.label }} <b-tag rounded>{{boxes[tab.boxType].count}}</b-tag></span>
          </template>

          <sms-box
            :bus="buses[idx]"
            :box-type="tab.boxType"
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
import {selectionStates} from '@/components/sms/select';
import SmsBox from '@/components/sms/SmsBox.vue';
import SmsDialog from '@/components/sms/dialogs/SmsDialog.vue';
import router from 'huawei-router-api/browser';
import {modes} from '@/store';
import {mapState, mapGetters, mapActions} from 'vuex';

import {boxTypes} from '@/store/modules/sms';

export default {
  components: {
    SmsActions,
    SmsBox,
    SmsDialog,
  },
  data() {
    const tabs = [
      {boxType: boxTypes.LOCAL_INBOX, label: this.$i18n('sms_box_inbox'), icon: 'inbox'},
      {boxType: boxTypes.LOCAL_SENT, label: this.$i18n('sms_box_sent'), icon: 'send'},
      {boxType: boxTypes.LOCAL_DRAFT, label: this.$i18n('sms_box_draft'), icon: 'file'},
    ];
    const buses = [];
    for (let i=0; i<tabs.length; i++) {
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
      importEnabled: false,
    };
  },
  mounted() {
    // Redirect these events to the active tab
    const eventsToRedirect = [
      'sms-actions:clear-selection',
      'sms-actions:select-all',
      'sms-actions:select',
      'sms-actions:delete',
      'sms-actions:mark-as-read',
    ];
    for (const event of eventsToRedirect) {
      this.bus.$on(event, data => {
        this.currentBus.$emit(event, data);
      });
    }

    this.bus.$on('sms-actions:new', this.newMessage);
    this.bus.$on('sms-actions:import', this.importClicked);

    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
    this.globalBus.$on('refresh:sms', this.refresh);
  },
  computed: {
    ...mapState({
      boxes: state => state.sms.boxes,
      localMax: state => state.sms.local.max,
    }),
    ...mapGetters({
      simTotal: 'sms/simTotal',
      localTotal: 'sms/localTotal',
    }),
    boxType() {
      return this.tabs[this.currentTab].boxType;
    },
    currentBus() {
      return this.buses[this.currentTab];
    },
    isInbox() {
      return this.boxType === boxTypes.LOCAL_INBOX;
    },
    box() {
      return this.boxes[this.boxType];
    },
    selected() {
      return this.box.selected;
    },
    selectionState() {
      // TODO: Consider moving into mixin for use elsewhere
      let selectionState;
      if (this.box.selected.length === this.box.messages.length) {
        selectionState = selectionStates.ALL;
      } else if (this.box.selected.length > 0) {
        selectionState = selectionStates.SOME;
      } else {
        selectionState = selectionStates.NONE;
      }
      return selectionState;
    },
  },
  methods: {
    ...mapActions({
      getSmsCount: 'sms/getCount',
    }),
    changedTab(idx) {
      this.currentTab = idx;
    },
    async refreshAdmin() {
      // TODO: Refresh every once in a while
      await this.getSmsCount();
      this.checkImport();
    },
    refresh() {
      if (this.$adminMode) {
        this.refreshAdmin();
      }
    },

    /* SMS dialog */
    smsDialogClose() {
      this.$refs['smsDialogModal'].close();
    },
    smsDialogSave() {
      this.globalBus.$emit('refresh:sms', boxTypes.LOCAL_DRAFT);
      this.smsDialogClose();
    },
    smsDialogSend() {
      this.globalBus.$emit('refresh:sms', boxTypes.LOCAL_DRAFT);
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

    /**
     * Checks if importing messages from the SIM card is supported on this router
     */
    async checkImport() {
      const smsConfig = await router.config.getSmsConfig();
      this.importEnabled = smsConfig.import_enabled;
      return this.importEnabled;
    },
    /**
     * Imports messages from the SIM card
     */
    async import() {
      try {
        const info = await router.sms.importMessages();
        if (info.successNumber > 0) {
          this.globalBus.$emit('refresh:sms');
        }
        this.$toast.open({
          type: info.successNumber > 0 && info.failNumber === 0 ? 'is-success' : 'is-dark',
          message: this.$i18n('sms_import_complete', info.successNumber, info.failNumber),
        });
      } catch (e) {
        if (e instanceof router.errors.RouterError) {
          switch (e.code) {
          case 'sms_import_sim_empty':
            // No messages to import
            this.$toast.open(this.$i18n('sms_import_complete', 0, 0));
            break;
          case 'sms_not_enough_space':
            this.$dialogAlert({
              type: 'danger',
              message: this.$i18n('sms_import_error_not_enough_space'),
            });
            break;
          case 'sms_import_invalid_response':
            // Generic unknown error
            this.$dialogAlert({
              type: 'danger',
              message: this.$i18n('sms_import_error_generic'),
            });
            throw e;
          default:
            throw e;
          }
        } else {
          throw e;
        }
      }
    },
    async importClicked() {
      await this.getSmsCount();
      // Ask user if they want to import messages
      this.$dialogConfirm({
        message: this.$i18n('sms_import_confirm', this.simTotal),
        confirmText: this.$i18n('generic_yes'),
        onConfirm: () => {
          // If there is space for some but not all messages to be imported, inform user
          const available = this.localMax - this.localTotal;
          const toImport = this.simTotal;
          if (available > 0 && toImport > available) {
            this.$dialogAlert({
              message: this.$i18n('sms_import_warning_not_enough_space', available, toImport),
              type: 'warning',
              onConfirm: this.import,
            });
          } else {
            this.import();
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .sms-action-wrapper{
    padding: 1rem;
  }
</style>
