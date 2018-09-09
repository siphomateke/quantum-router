<template>
  <div class="sms-list">
    <div
      v-if="paginated && pageCount > 1"
      class="level">
      <div class="level-left">
        <div
          v-if="showGoToPage"
          class="level-item">
          <form @submit.prevent="goToPage">
            <b-field grouped>
              <b-input
                ref="goToPageInput"
                :min="1"
                :max="pageCount"
                v-model="goToPageNumber"
                type="number"/>
              <p class="control">
                <button
                  type="submit"
                  class="button is-primary">Go</button>
              </p>
            </b-field>
          </form>
        </div>
      </div>
      <div class="level-right">
        <div
          v-if="showTopPagination"
          class="level-item">
          <b-pagination
            :total="internalTotal"
            :per-page="perPage"
            :current.sync="internalPage"/>
        </div>
      </div>
    </div>
    <b-table
      :data="list"
      :bordered="false"
      :striped="true"
      :narrowed="true"
      :loading="loading"
      :mobile-cards="true"
      :checked-rows.sync="internalCheckedRows"
      :checkable="checkable"

      :paginated="paginated"
      :backend-pagination="backendPagination"
      :total="total"
      :current-page.sync="internalPage"
      :per-page="perPage"

      :backend-sorting="backendSorting"
      :default-sort-direction="sortOrder"
      :default-sort="['date', sortOrder]"
      @sort="onSort">
      <template slot-scope="props">
        <b-table-column
          v-if="typeof props.row.read === 'boolean' && showReadStatus"
          field="read">
          <b-icon
            :title="$i18n(props.row.read ? 'sms.message.read' : 'sms.message.unread')"
            :icon="props.row.read ? 'envelope-open-o' : 'envelope'"/>
        </b-table-column>
        <b-table-column
          v-if="showType"
          :label="$i18n('sms.listHeaders.type')"
          field="type">
          <b-icon
            :title="getSmsTypeName(props.row.parsed.type)"
            :pack="smsTypeIcons[props.row.parsed.type].pack"
            :icon="smsTypeIcons[props.row.parsed.type].id"/>
        </b-table-column>
        <b-table-column
          :label="$i18n('sms.listHeaders.number')"
          field="number">{{ props.row.number }}</b-table-column>
        <b-table-column
          :label="$i18n('sms.listHeaders.content')"
          field="content">
          <div class="content message-content">{{ props.row.content }}</div>
        </b-table-column>
        <b-table-column
          :label="$i18n('sms.listHeaders.date')"
          field="date"
          sortable
          centered>
          <time
            :datetime="props.row.date"
            style="white-space:nowrap;">{{ formatDate(props.row.date) }}</time>
        </b-table-column>
        <td
          v-if="showEditButton"
          class="edit-button-column">
          <button
            :title="$i18n('sms.editMessageTooltip')"
            class="button is-primary"
            @click="editMessage(props.index)">
            <b-icon icon="edit"/>
          </button>
        </td>
      </template>

      <template slot="empty">
        <section class="section">
          <template v-if="!loading">
            <p>{{ $i18n('sms.empty') }}</p>
          </template>
        </section>
      </template>

      <template
        v-if="internalTotal > 1"
        slot="bottom-left">
        <span>{{ pageInfo }}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
import { momentFormat } from '@/utils';
import smsTypeMixin from '@/mixins/smsType';

export default {
  mixins: [smsTypeMixin],
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    checkable: {
      type: Boolean,
      default: false,
    },
    checkedRows: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 20,
    },
    backendSorting: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: String,
      default: 'desc',
    },
    paginated: {
      type: Boolean,
      default: false,
    },
    backendPagination: {
      type: Boolean,
      default: false,
    },
    page: {
      type: Number,
      default: 1,
    },
    showReadStatus: {
      type: Boolean,
      default: false,
    },
    showType: {
      type: Boolean,
      default: false,
    },
    showEditButton: {
      type: Boolean,
      default: false,
    },
    showTopPagination: {
      type: Boolean,
      default: false,
    },
    showGoToPage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalPage: this.page,
      internalCheckedRows: this.checkedRows,
      goToPageNumber: '',
    };
  },
  computed: {
    pageInfo() {
      const first = ((this.internalPage - 1) * this.perPage) + 1;
      const last = (((this.internalPage - 1) * this.perPage) + this.perPage) + 1;
      if (last > this.internalTotal) {
        return this.$i18n('sms.firstToLast', { first, last: this.internalTotal });
      }
      return this.$i18n('sms.firstToLastOfTotal', { first, last, total: this.internalTotal });
    },
    internalTotal() {
      return this.backendPagination ? this.total : this.list.length;
    },
    pageCount() {
      if (!this.paginated) return 0;

      if (typeof this.internalTotal === 'number' && typeof this.perPage === 'number') {
        return Math.ceil(this.internalTotal / this.perPage);
      }
      return 0;
    },
  },
  watch: {
    checkedRows(val) {
      this.internalCheckedRows = val;
    },
    internalCheckedRows(val) {
      this.$emit('update:checkedRows', val);
    },
    page(value) {
      this.internalPage = value;
    },
    internalPage(value) {
      this.$emit('update:page', value);
      this.$emit('page-change', value);
    },
  },
  methods: {
    formatDate(date) {
      return momentFormat(date, 'Y-M-D HH:mm:ss');
    },
    goToPage() {
      const page = this.goToPageNumber;
      if (this.$refs.goToPageInput.checkHtml5Validity()) {
        this.internalPage = parseInt(page, 10);
        this.goToPageNumber = '';
      }
    },
    onSort(field, order) {
      this.$emit('sort', order);
    },
    editMessage(index) {
      this.$emit('edit', index);
    },
  },
};
</script>

<style lang="scss">
.edit-button-column{
  text-align: right;
}
.message-content {
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
