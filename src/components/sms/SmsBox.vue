<template>
  <div class="sms-box">
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
      :show-edit-button="isDraft"
      @page-change="onPageChange"
      @sort="onSort"
      @edit="editMessage">
    </sms-list>
  </div>
</template>

<script>
import Vue from 'vue';
import SmsList from '@/components/sms/SmsList.vue';
import router from 'huawei-router-api/browser';
import {modes} from '@/store';

export default {
  name: 'sms-box',
  components: {
    SmsList,
  },
  props: {
    'box-type': Number,
    'bus': {
      type: Object,
      validator(val) {
        return val instanceof Vue;
      },
    },
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
    };
  },
  computed: {
    isInbox() {
      return this.boxType === router.sms.boxTypes.INBOX;
    },
    isDraft() {
      return this.boxType === router.sms.boxTypes.DRAFT;
    },
  },
  watch: {
    checkedRows(val) {
      this.$emit('update:checked-rows', val);
    },
  },
  mounted() {
    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
    this.bus.$on('sms-actions:clear-checked', this.clearChecked);
    this.bus.$on('sms-actions:delete', this.deleteMessages);
    this.bus.$on('sms-actions:mark-as-read', this.markMessagesAsRead);
  },
  methods: {
    refreshAdmin() {
      this.loadAsyncData();
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
            message: this.$i18n(
              'sms_mark_read_partial_error',
              successful, this.checkedRows.length),
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
    editMessage(index) {
      this.$emit('edit', this.list[index]);
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
