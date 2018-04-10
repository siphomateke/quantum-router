<template>
  <div class="sms-box">
    <sms-list
      :list="list"
      :loading="loading"
      :checkable="true"
      :checked-rows.sync="checkedRows"
      :total="total"
      :paginated="pageCount > 1"
      :page.sync="page"
      :per-page="perPage"
      :backend-pagination="true"
      :show-top-pagination="true"
      :show-go-to-page="true"
      :backend-sorting="true"
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
import {selectionStates} from '@/components/sms/select';
import router from 'huawei-router-api/browser';
import {modes} from '@/store';
import {mapState, mapActions} from 'vuex';
import DeleteSmsDialog from '@/components/sms/dialogs/DeleteSmsDialog.vue';

export default {
  name: 'sms-box',
  components: {
    SmsList,
  },
  props: {
    boxType: {},
    bus: {
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
    ...mapState({smsCount: state => state.sms.count}),
    isInbox() {
      return this.boxType === router.sms.boxTypes.INBOX;
    },
    isDraft() {
      return this.boxType === router.sms.boxTypes.DRAFT;
    },
    pageCount() {
      return Math.ceil(this.total / this.perPage);
    }
  },
  watch: {
    checkedRows(val) {
      this.$emit('update:checked-rows', val);

      let selectionState;
      if (val.length === this.list.length) {
        selectionState = selectionStates.ALL;
      } else if (val.length > 0) {
        selectionState = selectionStates.SOME;
      } else {
        selectionState = selectionStates.NONE;
      }
      this.$emit('update:selection-state', selectionState);
    },
  },
  mounted() {
    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
    this.globalBus.$on('refresh:sms', this.refresh);
    this.bus.$on('sms-actions:clear-selection', this.clearSelection);
    this.bus.$on('sms-actions:select-all', this.selectAll);
    this.bus.$on('sms-actions:select', this.select);
    this.bus.$on('sms-actions:delete', this.deleteMessagesConfirm);
    this.bus.$on('sms-actions:mark-as-read', this.markMessagesAsRead);
  },
  methods: {
    ...mapActions({
      getSmsCount: 'sms/getCount'
    }),
    refreshAdmin() {
      this.loadAsyncData();
    },
    refresh(box) {
      if (box && box !== this.boxType) {
        return;
      }
      if (this.$adminMode) {
        this.refreshAdmin();
      }
    },
    // TODO: Update checked rows and handle any currently running tasks on refresh
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

        const list = [];
        await this.getSmsCount();
        let count = 0;
        switch (this.boxType) {
        case router.sms.boxTypes.INBOX:
          count = this.smsCount.LocalInbox;
          break;
        case router.sms.boxTypes.SENT:
          count = this.smsCount.LocalOutbox;
          break;
        case router.sms.boxTypes.DRAFT:
          count = this.smsCount.LocalDraft;
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
          list.push({
            index: parseInt(m.Index),
            number: m.Phone,
            date: m.Date,
            content: m.Content,
            read: read,
            parsed: parsed,
          });
        }
        this.list = list.slice();
        // NOTE: If selection is ever possible on more than one page, this will have to go;
        // all checkedRows' indecies should be checked to see if they still exist instead
        this.clearSelection();
      } catch (e) {
        // TODO: Handle error
        throw e;
      } finally {
        this.loading = false;
      }
    },
    onPageChange(page) {
      this.loadAsyncData();
    },
    onSort(order) {
      this.sortOrder = order;
      this.loadAsyncData();
    },
    parseMessage(message) {
      return router.sms.parse(message);
    },
    async deleteMessages() {
      const indices = this.checkedRows.map(row => row.index);
      await router.sms.deleteSms(indices);
      // TODO: delete sms loading indicator
      this.clearSelection();
      this.globalBus.$emit('refresh:sms');
    },
    deleteMessagesConfirm() {
      let self = this;
      this.$modal.open({
        parent: this,
        component: DeleteSmsDialog,
        props: {
          list: this.checkedRows,
        },
        events: {
          confirm: self.deleteMessages
        },
      });
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
        this.$error(e);
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
    clearSelection() {
      this.checkedRows = [];
    },
    selectAll() {
      // TODO: Decide if this should actually select all messages on all pages asynchronously
      this.checkedRows = this.list.slice();
    },
    select(selector) {
      this.clearSelection();
      // TODO: Improve selector validation
      const validSelectorKeys = ['type', 'read'];
      let validSelector = false;
      for (const key of validSelectorKeys) {
        if (key in selector) {
          validSelector = true;
          break;
        }
      }
      if (validSelector) {
        for (const m of this.list) {
          let match = true;
          if ('type' in selector && selector.type !== m.parsed.type) {
            match = false;
          }
          if ('read' in selector && selector.read !== m.read) {
            match = false;
          }
          if (match) this.checkedRows.push(m);
        }
      }
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
