<template>
  <div class='sms-box'>
    <br>
    <div class="field is-grouped">
      <sms-action
        :label="this.$i18n('sms_action_clear_checked')"
        icon="times"
        type="is-danger"
        @click="clearChecked"
        :disabled="this.checkedRows.length === 0">
      </sms-action>
      <sms-action :label="this.$i18n('sms_action_new_message')" icon="plus" type="is-primary" @click="newMessage"></sms-action>
      <sms-action :label="this.$i18n('sms_action_delete')" icon="trash" type="is-danger"
      :disabled="this.checkedRows.length === 0" @click="deleteMessages"></sms-action>
      <sms-action :label="this.$i18n('sms_action_import')" icon="upload" :disabled="true"></sms-action>
      <sms-action v-if="isInbox" :label="this.$i18n('sms_action_mark_as_read')"
      :disabled="this.checkedRows.length === 0" @click="markMessagesAsRead"></sms-action>
    </div>
    <b-message type="is-info">
      <!-- TODO: Improve the way checked rows are displayed.
      Perhaps at the bottom of the screen -->
      <template v-if="checkedRows.length > 0">
        {{ this.$i18n('sms_checked_rows', checkedRows.length) }}
      </template>
      <template v-else>
        {{ this.$i18n('sms_message_count', list.length) }}
      </template>
    </b-message>
    <sms-list
    :list="list"
    :loading="loading"
    :checked-rows.sync="checkedRows"
    :total="total"
    :page="page"
    :per-page="perPage"
    :sort-order="sortOrder"
    :show-read-status="isInbox"
    @page-change="onPageChange"
    @sort="onSort">
    </sms-list>
    <b-modal :active.sync="showNewMessageDialog" has-modal-card>
      <sms-dialog></sms-dialog>
    </b-modal>
  </div>
</template>

<script>
import SmsList from '@/components/sms/SmsList.vue';
import SmsAction from '@/components/sms/SmsAction.vue';
import SmsDialog from '@/components/sms/SmsDialog.vue';
import router from '@/router';
import moment from 'moment';
import {modes} from '@/store';
import {Notification} from '@/chrome/notification.js';

export default {
  name: 'sms-box',
  components: {
    SmsList,
    SmsAction,
    SmsDialog,
  },
  props: {
    'box-type': Number,
  },
  data() {
    return {
      total: 0,
      loading: false,
      sortOrder: 'desc',
      page: 1,
      perPage: 20,
      list: [],
      checkedRows: [],
      showNewMessageDialog: false,
    };
  },
  computed: {
    mode() {
      return this.$store.state.mode;
    },
    adminMode() {
      return this.mode === modes.ADMIN;
    },
    isInbox() {
      return this.boxType === router.sms.boxTypes.INBOX;
    },
  },
  watch: {
    mode() {
      this.refresh();
    },
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      if (this.adminMode) {
        this.loadAsyncData();
      }
    },
    async loadAsyncData() {
      this.loading = true;
      router.sms.getSmsList({
        boxType: this.boxType,
        page: this.page,
        sortOrder: this.sortOrder,
        perPage: this.perPage,
      }).then((_messages) => {
        let messages = [];
        if (Array.isArray(_messages)) {
          messages = _messages;
        } else {
          messages.push(_messages);
        }

        this.list = [];
        return router.sms.getSmsCount().then((smsData) => {
          let count = 0;
          switch (this.boxType) {
          case router.sms.boxTypes.INBOX:
            count = smsData.LocalInbox;
            break;
          case router.sms.boxTypes.SENT:
            count = smsData.LocalOutbox;
            break;
          case router.sms.boxTypes.DRAFT:
            count = smsData.LocalDraft;
            break;
          }
          this.total = parseInt(count);

          for (let m of messages) {
            let parsed = this.parseMessage(m.Content);
            let smsReadStatus = parseInt(m.Smstat);
            let read = null;
            if (smsReadStatus === 0 || smsReadStatus === 1) {
              read = smsReadStatus === 1;
            }
            this.list.push({
              index: parseInt(m.Index),
              number: m.Phone,
              date: m.Date,
              content: m.Content,
              read: read,
              parsed: parsed,
            });
          }
        });
      }).then(() => {
        this.loading = false;
      });
    },
    onPageChange(page) {
      this.page = page;
      this.loadAsyncData();
    },
    onSort(order) {
      this.sortOrder = order;
      this.loadAsyncData();
    },
    parseMessage(message) {
      return router.sms.parse(message);
    },
    newMessage() {
      this.showNewMessageDialog = true;
    },
    deleteMessages() {
      let indices = this.checkedRows.map((row) => row.index);
      router.sms.deleteSms(indices);
      // TODO: delete sms loading indicator
      this.refresh();
    },
    markMessagesAsRead() {
      // TODO: Mark sms as read indicator
      for (let checkedRow of this.checkedRows) {
        if (this.isInbox && checkedRow.read === false) {
          router.sms.setSmsAsRead(checkedRow.index).then(() => {
            let row = this.list.find((row) => row.index === checkedRow.index);
            row.read = true;
          });
        }
      }
    },
    clearChecked() {
      this.checkedRows = [];
    },
  },
};
</script>
