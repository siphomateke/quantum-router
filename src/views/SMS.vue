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
    <b-message title="Error" type="is-danger" has-icon :active.sync="error.visible">
        {{ error.message }}
    </b-message>
    <b-table
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
      <template scope="props">
          <b-table-column field="read" sortable>{{ props.row.read }}</b-table-column>
          <b-table-column label="Number" field="number" sortable>{{ props.row.number }}</b-table-column>
          <b-table-column label="Content" field="content" sortable>
            <div class="content">{{ props.row.content }}</div>
          </b-table-column>
          <b-table-column width="120" field="date" label="Date" sortable centered>{{ formatDate(props.row.date) }}</b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <p class="content">No messages found.</p>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
/* global chrome */
import {SmsList} from '@/components/sms';
import {RouterController} from '../chrome/router.js';
import moment from 'moment';

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
      error: {
        visible: false,
        message: '',
      },
    };
  },
  mounted() {
    this.loadAsyncData();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.from === 'background' && request.type === 'ready') {
        this.loadAsyncData();
      }
    });
  },
  methods: {
    /*
    * Load async data
    */
    async loadAsyncData() {
      this.loading = true;
      this.error.visible = false;
      try {
        let data = await RouterController.getSmsList({
          page: this.page,
          sortOrder: this.sortOrder,
          perPage: this.perPage,
        });
        const _messages = data.Messages.Message;
        let messages = [];
        if (Array.isArray(_messages)) {
          messages = _messages;
        } else {
          messages.push(_messages);
        }

        this.list = [];
        let smsData = await RouterController.getSmsCount();
        let currentTotal = smsData.LocalInbox;
        if (smsData.LocalInbox / this.perPage > 10) {
          currentTotal = this.perPage * 10;
        }
        this.total = currentTotal;

        for (let m of messages) {
          this.list.push({
            number: m.Phone,
            date: m.Date,
            content: m.Content,
            read: false,
          });
        }

        this.loading = false;
      } catch (err) {
        this.loading = false;
        this.error.message = 'Oops! An error occured: ' + err.message;
        this.error.visible = true;
        console.error(err);
      }
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
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';
</style>
