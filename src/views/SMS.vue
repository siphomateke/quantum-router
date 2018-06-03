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
          :id.sync="dialog.id"
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
import {mapState, mapGetters} from 'vuex';
import {boxTypes} from '@/store/modules/sms';

// Redirect these events to the active tab
const eventsToRedirect = [
  'sms-actions:clear-selection',
  'sms-actions:select-all',
  'sms-actions:select',
  'sms-actions:delete',
  'sms-actions:mark-as-read',
];

const callbacks = {};

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
        id: -1,
        numbers: [],
        content: '',
      },
    };
  },
  mounted() {
    for (const event of eventsToRedirect) {
      callbacks[event] = data => {
        this.currentBus.$emit(event, data);
      };
      this.bus.$on(event, callbacks[event]);
    }

    this.bus.$on('sms-actions:new', this.newMessage);
    this.bus.$on('sms-actions:import', this.import);

    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
    this.globalBus.$on('refresh:sms', this.refresh);
  },
  beforeDestroy() {
    for (const event of eventsToRedirect) {
      this.bus.$off(event, callbacks[event]);
    }
    this.bus.$off('sms-actions:new', this.newMessage);
    this.bus.$off('sms-actions:import', this.import);
    this.globalBus.$off('mode-change:admin', this.refreshAdmin);
    this.globalBus.$off('refresh:sms', this.refresh);
  },
  computed: {
    ...mapState({
      boxes: state => state.sms.boxes,
      importEnabled: state => state.sms.importEnabled,
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
    changedTab(idx) {
      this.currentTab = idx;
    },
    async refreshAdmin() {
      // TODO: Refresh every once in a while
      await this.$store.dispatch('sms/getCount');
      this.$store.dispatch('sms/checkImport');
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
      this.dialog.id = -1;
      this.dialog.numbers = [];
      this.dialog.content = '';
      this.showSmsDialog = true;
    },
    editMessage(message) {
      this.dialog.id = message.id;
      this.dialog.numbers = message.number.split(';');
      this.dialog.content = message.content;
      this.showSmsDialog = true;
    },
    async import() {
      this.$store.dispatch('sms/importConfirm');
    },
  },
};
</script>

<style lang="scss" scoped>
  .sms-action-wrapper{
    padding: 1rem;
  }
</style>
