<template>
  <div class="box">
    <div class="field is-grouped">
      <div v-for="action in actions" :key="action.name" class="control">
        <button class="button" :class="action.class">
          <b-icon v-if="action.icon" :icon="action.icon"></b-icon>
          <span>{{action.label}}</span>
        </button>
      </div>
    </div>
    <sms-list
    v-if="this.adminMode"
    :list="list"
    :loading="loading"
    :checked-rows="checkedRows"
    :total="total"
    :per-page="perPage"
    :sort-order="sortOrder"
    @page-change="onPageChange"
    @sort="onSort">
    </sms-list>
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
      sortOrder: 'desc',
      page: 1,
      perPage: 20,
      list: [],
      checkedRows: [],
      actions: [
        {name: 'new_message', label: 'New message', icon: 'plus', class: 'is-primary'},
        {name: 'delete', label: 'Delete', icon: 'trash', class: 'is-danger'},
        {name: 'import', label: 'Import', icon: 'download'},
        {name: 'mark_as_read', label: 'Mark as read'}
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
      }).then((_messages) => {
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
              read: parseInt(m.Smstat) === 1,
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
    onSort(order) {
      this.sortOrder = order;
      this.loadAsyncData();
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
