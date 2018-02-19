<template>
  <div class="sms-box">
    <div class="level is-mobile">
      <div class="level-left">
        <!-- TODO: Make action buttons show loading progress -->
        <b-field grouped>
          <b-field>
            <sms-box-button
              :label="this.$i18n('sms_action_clear_checked')"
              icon="times" type="is-danger"
              @click="clearChecked"
              :disabled="checkedRows.length === 0">
            </sms-box-button>
          </b-field>

          <b-field>
            <action-button
              icon="trash"
              :disabled="checkedRows.length === 0"
              @click="deleteMessages">
            </action-button>
            <action-button v-if="isInbox"
              :label="this.$i18n('sms_action_mark_as_read')"
              :disabled="checkedRows.length === 0"
              @click="markMessagesAsRead">
            </action-button>
          </b-field>
        </b-field>
      </div>

      <div class="level-right">
        <b-field grouped>
          <b-field>
            <action-button
              :label="this.$i18n('sms_action_new_message')"
              icon="plus" type="is-primary"
              @click="newMessage">
            </action-button>
          </b-field>
          <b-field>
            <action-button
              :label="this.$i18n('sms_action_import')"
              icon="upload"
              :disabled="true">
            </action-button>
          </b-field>
        </b-field>
      </div>
    </div>
    <sms-list
    :list="list"
    :loading="loading"
    :checked-rows.sync="checkedRows"
    :total="total"
    :page="page"
    :per-page="perPage"
    :sort-order="sortOrder"
    :show-read-status="isInbox"
    :show-type="isInbox"
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
import SmsBoxButton from '@/components/sms/SmsBoxButton.vue';
import SmsDialog from '@/components/sms/SmsDialog.vue';
import ActionButton from '@/components/ActionButton.vue';
import router from 'huawei-router-api/browser';
import moment from 'moment';
import {modes} from '@/store';
import {Notification} from '@/chrome/notification.js';

export default {
  name: 'sms-box',
  components: {
    SmsList,
    SmsBoxButton,
    SmsDialog,
    ActionButton,
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
      try {
        const _messages = await router.sms.getSmsList({
          boxType: this.boxType,
          page: this.page,
          sortOrder: this.sortOrder,
          perPage: this.perPage,
        });
        let messages = [];
        if (Array.isArray(_messages)) {
          messages = _messages;
        } else {
          messages.push(_messages);
        }

        this.list = [];
        const smsData = await router.sms.getSmsCount();
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

        for (const m of messages) {
          const parsed = this.parseMessage(m.Content);
          const smsReadStatus = parseInt(m.Smstat);
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
      } catch (e) {
        // TODO: Handle error
        throw e;
      } finally {
        this.loading = false;
      }
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
      const indices = this.checkedRows.map(row => row.index);
      router.sms.deleteSms(indices);
      // TODO: delete sms loading indicator
      this.refresh();
    },
    markMessagesAsRead() {
      const promises = [];
      let successful = 0;
      for (const checkedRow of this.checkedRows) {
        if (this.isInbox && checkedRow.read === false) {
          promises.push(router.sms.setSmsAsRead(checkedRow.index).then(() => {
            const row = this.list.find(row => row.index === checkedRow.index);
            // Row could be undefined if the checked row is on another page
            if (row) {
              row.read = true;
            }
            successful += 1;
          }));
        }
      }
      Promise.all(promises).then(() => {
        this.$toast.open({
          message: 'Marked '+successful+' message(s) as read',
          type: 'is-success',
        });
      }).catch(e => {
        this.handleError(e);
        if (successful > 0) {
          this.$toast.open({
            message: this.$i18n('sms_mark_read_partial_error', successful, this.checkedRows.length),
            type: 'is-danger',
          });
        } else {
          this.$toast.open({
            message: this.$i18n('sms_mark_read_error'),
            type: 'is-danger',
          });
        }
      });
    },
    clearChecked() {
      this.checkedRows = [];
    },
  },
};
</script>

<style lang="scss">
  .sms-list {
    .table td {
      vertical-align: middle;
    }
  }
</style>
