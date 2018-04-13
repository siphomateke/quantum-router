<template>
  <div class="sms-box">
    <sms-list
      :list="messages"
      :loading="loading"
      :checkable="true"
      :checked-rows="checkedRows"
      @update:checkedRows="updateCheckedRows"
      :total="count"
      :paginated="pageCount > 1"
      :page="page"
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
import router from 'huawei-router-api/browser';
import {boxTypes} from '@/store/modules/sms';
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
  computed: {
    ...mapState({
      boxes: state => state.sms.boxes,
      allMessages: state => state.sms.messages,
    }),
    box() {
      return this.boxes[this.boxType];
    },
    loading() {
      return this.box.loading;
    },
    count() {
      return this.box.count;
    },
    sortOrder() {
      return this.box.sortOrder;
    },
    perPage() {
      return this.box.perPage;
    },
    page() {
      return this.box.page;
    },
    messages() {
      if (this.page in this.box.messages) {
        return this.box.messages[this.page].map(index => this.allMessages[index]);
      }
      return [];
    },
    selected() {
      return this.box.selected;
    },
    checkedRows() {
      return this.selected.map(index => this.allMessages[index]);
    },
    isInbox() {
      return this.boxType === boxTypes.LOCAL_INBOX;
    },
    isDraft() {
      return this.boxType === boxTypes.LOCAL_DRAFT;
    },
    pageCount() {
      return Math.ceil(this.count / this.perPage);
    },
  },
  mounted() {
    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
    this.globalBus.$on('refresh:sms', this.refresh);
    this.bus.$on('sms-actions:clear-selection', this.clearSelected);
    this.bus.$on('sms-actions:select-all', this.selectAll);
    this.bus.$on('sms-actions:select', this.select);
    this.bus.$on('sms-actions:delete', this.deleteMessagesConfirm);
    this.bus.$on('sms-actions:mark-as-read', this.markMessagesAsRead);
  },
  methods: {
    ...mapActions({
      clearSelected: 'sms/clearSelected',
    }),
    async dispatch(name, payload={}) {
      payload.box = this.boxType;
      await this.$store.dispatch(name, payload);
    },
    refreshAdmin() {
      // TODO: Update checked rows and handle any currently running tasks on refresh
      this.$store.dispatch('sms/getMessages', this.boxType);
    },
    refresh(box) {
      if (box && box !== this.boxType) {
        return;
      }
      if (this.$adminMode) {
        this.refreshAdmin();
      }
    },
    updateCheckedRows(rows) {
      this.dispatch('sms/setSelected', {
        indices: rows.map(row => row.index),
      });
    },
    onPageChange(page) {
      this.dispatch('sms/setPage', {value: page});
    },
    onSort(order) {
      this.dispatch('sms/setSortOrder', {value: order});
    },
    async deleteMessages() {
      // TODO: Use Vuex
      /* await router.sms.deleteSms(this.selected);
      // TODO: delete sms loading indicator
      this.clearSelected();
      this.globalBus.$emit('refresh:sms'); */
    },
    deleteMessagesConfirm() {
      const self = this;
      this.$modal.open({
        parent: this,
        component: DeleteSmsDialog,
        props: {
          list: this.checkedRows,
        },
        events: {
          confirm: self.deleteMessages,
        },
      });
    },
    markMessagesAsRead() {
      // TODO: Use Vuex
      /* const promises = [];
      let successful = 0;
      for (const checkedRow of this.checkedRows) {
        if (this.isInbox && checkedRow.read === false) {
          promises.push(router.sms.setSmsAsRead(checkedRow.index).then(() => {
            const row = this.messages.find(row => row.index === checkedRow.index);
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
              successful, this.selected.length),
            type: 'is-danger',
          });
        } else {
          this.$toast.open({
            message: this.$i18n('sms_mark_read_error'),
            type: 'is-danger',
          });
        }
      }); */
    },
    selectAll() {
      // TODO: Decide if this should actually select all messages on all pages asynchronously
      this.dispatch('sms/setSelected', {
        indices: this.messages.map(row => row.index),
      });
    },
    select(selector) {
      // TODO: Use Vuex
      /* this.clearSelected();
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
        for (const m of this.messages) {
          let match = true;
          if ('type' in selector && selector.type !== m.parsed.type) {
            match = false;
          }
          if ('read' in selector && selector.read !== m.read) {
            match = false;
          }
          if (match) {
            this.dispatch('sms/addToSelected', {
              index: m.index,
            });
          }
        }
      } */
    },
    editMessage(index) {
      this.$emit('edit', this.messages[index]);
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
