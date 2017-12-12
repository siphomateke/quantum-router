<template>
  <div class='sms-box'>
    <br>
    <div class="field is-grouped">
      <sms-action label="New message" icon="plus" type="is-primary" @click="newMessage"></sms-action>
      <sms-action label="Delete" icon="trash" type="is-danger"
      :disabled="this.checkedRows.length === 0" @click="deleteMessages"></sms-action>
      <sms-action label="Import" icon="upload" :disabled="true"></sms-action>
      <sms-action label="Mark as read"
      :disabled="this.checkedRows.length === 0" @click="markMessagesAsRead"></sms-action>
    </div>
    <b-message type="is-info">
      <template v-if="checkedRows.length > 0">
        {{ checkedRows.length }} row(s) selected
      </template>
      <template v-else>
        Showing {{list.length}} messages
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
import {RouterController, SmsUtils, SmsBoxTypes} from '@/chrome/router.js';
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
      RouterController.getSmsList({
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
        return RouterController.getSmsCount().then((smsData) => {
          let count = 0;
          switch (this.boxType) {
            case SmsBoxTypes.INBOX:
              count = smsData.LocalInbox;
              break;
            case SmsBoxTypes.SENT:
              count = smsData.LocalOutbox;
              break;
            case SmsBoxTypes.DRAFT:
              count = smsData.LocalDraft;
              break;
          }
          this.total = parseInt(count);

          for (let m of messages) {
            let parsed = this.parseMessage(m.Content);
            this.list.push({
              index: parseInt(m.Index),
              number: m.Phone,
              date: m.Date,
              content: m.Content,
              read: parseInt(m.Smstat) === 1,
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
      return SmsUtils.parse(message);
    },
    newMessage() {
      this.showNewMessageDialog = true;
    },
    deleteMessages() {
      let indices = this.checkedRows.map(row => row.index);
      RouterController.deleteSms(indices);
      // TODO: delete sms loading indicator
      this.refresh();
    },
    markMessagesAsRead() {
      // TODO: Mark sms as read indicator
      let indices = this.checkedRows.map(row => row.index);
      for (let idx of indices) {
        RouterController.setSmsAsRead(idx).then(() => {
          let row = this.list.find(row => row.index === idx);
          row.read = true;
        });
      }
    },
  },
};
</script>
