<template>
  <div class="box">
    <div class="field is-grouped">
      <div v-for="action in actions" :key="action.name" class="control">
        <button class="button" :class="action.class">
          <b-icon :icon="action.icon"></b-icon>
          <span>{{action.label}}</span>
        </button>
      </div>
    </div>
    <!-- <sms-list :list="list" :checked-rows="checkedRows"></sms-list> -->
    <b-table
    v-if="this.adminMode"
    :data="list"
    :bordered="true"
    :striped="false"
    :narrowed="false"
    :loading="loading"
    :mobile-cards="true"
    :checked-rows.sync="checkedRows"
    checkable

    paginated
    backend-pagination
    :total="total"
    :per-page="perPage"
    @page-change="onPageChange"

    backend-sorting
    :default-sort-direction="sortOrder"
    :default-sort="[sortField, sortOrder]"
    @sort="onSort">
      <template slot-scope="props">
          <b-table-column field="read" sortable>{{ props.row.read }}</b-table-column>
          <b-table-column label="Number" field="number" sortable>{{ props.row.number }}</b-table-column>
          <b-table-column label="Content" field="content" sortable>
            <div class="content">{{ props.row.content }}</div>
          </b-table-column>
          <b-table-column width="120" field="date" label="Date" sortable centered>{{ formatDate(props.row.date) }}</b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <template v-if="!loading">
            <p>There are no SMSs</p>
          </template>
        </section>
      </template>
    </b-table>
    <template v-else>
      <b-message type="is-info" has-icon>
        You must have administrator access to view SMS messages
      </b-message>
    </template>
  </div>
</template>

<script>
/* global chrome */
import {SmsList} from '@/components/sms';
import {RouterController, SmsUtils} from '@/chrome/router.js';
import moment from 'moment';
import {modes} from '@/store';
import {Notification} from '@/chrome/notification.js';

export default {
  components: {
    'sms-list': SmsList,
  },
  data() {
    return {
      total: 0,
      loading: false,
      sortField: 'number',
      sortOrder: 'desc',
      page: 1,
      perPage: 20,
      list: [],
      checkedRows: [],
      actions: [
        {name: 'new_message', label: 'New message', icon: 'plus', class: 'is-primary'},
        {name: 'delete', label: 'Delete', icon: 'trash', class: 'is-danger'},
        {name: 'import', label: 'Import', icon: 'download'},
      ],
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
    RouterController.getSmsCount().then((_data) => {
      return RouterController.getSmsList({
        // TODO: Get all SMSs
        perPage: 20,
      }).then((data) => {
        for (let message of data.Messages.Message) {
          this.$store.dispatch('addNotification', new Notification({
            title: 'SMS',
            message: message.Content,
          }));
        }
      });
    });
  },
  methods: {
    refresh() {
      if (this.adminMode) {
        this.loadAsyncData();
      }
    },
    /*
    * Load async data
    */
    async loadAsyncData() {
      this.loading = true;
      RouterController.getSmsList({
        page: this.page,
        sortOrder: this.sortOrder,
        perPage: this.perPage,
      }).then((data) => {
        const _messages = data.Messages.Message;
        let messages = [];
        if (Array.isArray(_messages)) {
          messages = _messages;
        } else {
          messages.push(_messages);
        }

        this.list = [];
        return RouterController.getSmsCount().then((smsData) => {
          let currentTotal = smsData.LocalInbox;
          if (smsData.LocalInbox / this.perPage > 10) {
            currentTotal = this.perPage * 10;
          }
          this.total = currentTotal;

          for (let m of messages) {
            let parsed = this.parseMessage(m.Content);
            this.list.push({
              number: m.Phone,
              date: m.Date,
              content: m.Content,
              read: false,
              parsed: parsed,
            });
          }
        });
      }).then(() => {
        this.loading = false;
      });
    },
    /*
    * Handle page-change event
    */
    onPageChange(page) {
      this.page = page;
      this.loadAsyncData();
    },
    /*
    * Handle sort event
    */
    onSort(field, order) {
      this.sortField = field;
      this.sortOrder = order;
      this.loadAsyncData();
    },

    formatDate(date) {
      return moment(date).fromNow();
    },

    parseMessage(message) {
      return SmsUtils.parse(message);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';
</style>
