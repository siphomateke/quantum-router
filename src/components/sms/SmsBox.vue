<template>
  <div class="sms-box">
    <sms-list
      :list="messages"
      :loading="loading"
      :checkable="true"
      :checked-rows="checkedRows"
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
      @update:checkedRows="updateCheckedRows"
      @page-change="onPageChange"
      @sort="onSort"
      @edit="editMessage"/>
  </div>
</template>

<script>
import Vue from 'vue';
import SmsList from '@/components/sms/SmsList.vue';
import { boxTypes } from '@/store/modules/sms';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'SmsBox',
  components: {
    SmsList,
  },
  props: {
    boxType: {
      type: String,
      default: null,
      validator: value => Object.values(boxTypes).includes(value),
    },
    bus: {
      type: Object,
      default: null,
      validator: val => val instanceof Vue,
    },
  },
  computed: {
    ...mapState({
      boxes: state => state.sms.boxes,
      allMessages: state => state.sms.messages,
    }),
    ...mapGetters({
      getActualMessages: 'sms/actualMessages',
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
      return this.getActualMessages(this.box.messages);
    },
    selected() {
      return this.box.selected;
    },
    checkedRows() {
      return this.getActualMessages(this.selected);
    },
    isInbox() {
      return this.$store.getters['sms/isInbox'](this.boxType);
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
  beforeDestroy() {
    this.globalBus.$off('mode-change:admin', this.refreshAdmin);
    this.globalBus.$off('refresh:sms', this.refresh);
    this.bus.$off('sms-actions:clear-selection', this.clearSelected);
    this.bus.$off('sms-actions:select-all', this.selectAll);
    this.bus.$off('sms-actions:select', this.select);
    this.bus.$off('sms-actions:delete', this.deleteMessagesConfirm);
    this.bus.$off('sms-actions:mark-as-read', this.markMessagesAsRead);
  },
  methods: {
    async dispatch(name, payload = {}) {
      payload.box = this.boxType;
      await this.$store.dispatch(name, payload);
    },
    refreshAdmin() {
      // TODO: Update checked rows and handle any currently running tasks on refresh
      this.dispatch('sms/refresh');
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
        ids: rows.map(row => row.id),
      });
    },
    onPageChange(page) {
      this.dispatch('sms/setPage', { value: page });
    },
    onSort(order) {
      this.dispatch('sms/setSortOrder', { value: order });
    },
    deleteMessagesConfirm() {
      this.dispatch('sms/deleteSelectedMessagesConfirm');
    },
    markMessagesAsRead() {
      this.dispatch('sms/markSelectedMessagesAsRead');
    },
    selectAll() {
      // TODO: Decide if this should actually select all messages on all pages asynchronously
      this.dispatch('sms/selectAll');
    },
    select(selector) {
      this.dispatch('sms/select', { selector });
    },
    clearSelected() {
      this.dispatch('sms/clearSelected');
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
