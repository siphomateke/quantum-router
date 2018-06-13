<template>
  <div class="sms-list">
    <div class="level" v-if="paginated && pageCount > 1">
      <div class="level-left">
        <div class="level-item" v-if="showGoToPage">
          <form v-on:submit.prevent="goToPage">
            <b-field grouped>
              <b-input
                ref="goToPageInput"
                type="number"
                :min="1"
                :max="pageCount"
                v-model="goToPageNumber">
              </b-input>
              <p class="control">
                <button type="submit" class="button is-primary">Go</button>
              </p>
            </b-field>
          </form>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item" v-if="showTopPagination">
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
        <b-table-column field="read"
          v-if="typeof props.row.read === 'boolean' && showReadStatus">
          <b-icon :title="$i18n(props.row.read ? 'sms_read' : 'sms_unread')" :icon="props.row.read ? 'envelope-open-o' : 'envelope'"></b-icon>
        </b-table-column>
        <b-table-column field="type" :label="$i18n('sms_message_type')"
          v-if="showType">
          <b-icon
            :title="getSmsTypeName(props.row.parsed.type)"
            :pack="smsTypeIcons[props.row.parsed.type].pack"
            :icon="smsTypeIcons[props.row.parsed.type].id">
          </b-icon>
        </b-table-column>
        <b-table-column field="number" :label="$i18n('sms_message_number')">{{ props.row.number }}</b-table-column>
        <b-table-column field="content" :label="$i18n('sms_message_content')">
          <div class="content">{{ props.row.content }}</div>
        </b-table-column>
        <b-table-column field="date" :label="$i18n('sms_message_date')" sortable centered>
          <time style="white-space:nowrap;" :datetime="props.row.date">{{ formatDate(props.row.date) }}</time>
        </b-table-column>
        <td v-if="showEditButton" class="edit-button-column">
          <button
            class="button is-primary"
            @click="editMessage(props.index)"
            :title="$i18n('sms_edit_tooltip')">
              <b-icon icon="edit"></b-icon>
          </button>
        </td>
      </template>

      <template slot="empty">
        <section class="section">
          <template v-if="!loading">
            <p>{{ 'sms_empty' | $i18n }}</p>
          </template>
        </section>
      </template>

      <template slot="bottom-left" v-if="internalTotal > 1">
        <span>{{ pageInfo }}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
import moment from 'moment';
import smsTypeMixin from '@/mixins/smsType';

export default {
  mixins: [smsTypeMixin],
  props: {
    list: Array,
    checkable: {
      type: Boolean,
      default: false,
    },
    checkedRows: Array,
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
      const first = ((this.internalPage-1)*this.perPage)+1;
      const last = (((this.internalPage-1)*this.perPage)+this.perPage)+1;
      if (last > this.internalTotal) {
        return this.$i18n('sms_first_to_last', first, this.internalTotal);
      } else {
        return this.$i18n('sms_first_to_last_of_total', first, last, this.internalTotal);
      }
    },
    internalTotal() {
      return this.backendPagination ? this.total : this.list.length;
    },
    pageCount() {
      if (!this.paginated) return 0;

      if (!isNaN(this.internalTotal) && !isNaN(this.perPage)) {
        return Math.ceil(this.internalTotal / this.perPage);
      } else {
        return 0;
      }
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
      return moment(date).format('Y-M-D HH:mm:ss');
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
</style>
