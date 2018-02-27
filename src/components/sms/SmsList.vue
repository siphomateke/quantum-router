<template>
  <div class="sms-list">
    <b-table
    :data="list"
    :bordered="false"
    :striped="true"
    :narrowed="true"
    :loading="loading"
    :mobile-cards="true"
    :checked-rows.sync="internalCheckedRows"
    checkable

    paginated
    backend-pagination
    :total="total"
    :current-page="page"
    :per-page="perPage"
    @page-change="onPageChange"

    backend-sorting
    :default-sort-direction="sortOrder"
    :default-sort="['date', sortOrder]"
    @sort="onSort">
      <template slot-scope="props">
        <b-table-column field="read"
          v-if="typeof props.row.read === 'boolean' && showReadStatus">
          <b-icon :icon="props.row.read ? 'envelope-open-o' : 'envelope'"></b-icon>
        </b-table-column>
        <b-table-column field="type" :label="$i18n('sms_message_type')"
          v-if="showType">
          <b-icon :icon="getTypeIcon(props.row.parsed.type)"></b-icon>
        </b-table-column>
        <b-table-column field="number" :label="$i18n('sms_message_number')">{{ props.row.number }}</b-table-column>
        <b-table-column field="content" :label="$i18n('sms_message_content')">
          <div class="content">{{ props.row.content }}</div>
        </b-table-column>
        <b-table-column field="date" :label="$i18n('sms_message_date')" sortable centered>
          <span style="white-space:nowrap;">{{ formatDate(props.row.date) }}</span>
        </b-table-column>
        <td v-if="showEditButton" class="edit-button-column">
          <button
            class="button"
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

      <template slot="bottom-left" v-if="total > 1">
        <span>{{ pageInfo }}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
import moment from 'moment';
import router from 'huawei-router-api/browser';

const types = router.sms.types;

export default {
  props: {
    'list': Array,
    'checked-rows': Array,
    'loading': {
      type: Boolean,
      default: false,
    },
    'total': Number,
    'per-page': Number,
    'sort-order': String,
    'page': Number,
    'showReadStatus': {
      type: Boolean,
      default: false,
    },
    'showType': {
      type: Boolean,
      default: false,
    },
    'showEditButton': {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalCheckedRows: this.checkedRows,
    };
  },
  computed: {
    pageInfo() {
      const first = ((this.page-1)*this.perPage)+1;
      const last = (((this.page-1)*this.perPage)+this.perPage)+1;
      if (last > this.total) {
        return this.$i18n('sms_first_to_last', first, this.total);
      } else {
        return this.$i18n('sms_first_to_last_of_total', first, last, this.total);
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
  },
  methods: {
    // TODO: Add icon customization to settings
    getTypeIcon(type) {
      switch (type) {
      case types.RECHARGE:
        return 'bolt';
      case types.DATA:
        return 'area-chart';
      case types.DATA_PERCENT:
        return 'pie-chart';
      case types.ACTIVATED:
        return 'lightbulb-o';
      case types.DEPLETED:
        return 'exclamation';
      case types.AD:
        return 'bullhorn';
      default:
        return '';
      }
    },
    formatDate(date) {
      return moment(date).format('Y-M-D H:mm:ss');
    },
    onPageChange(page) {
      this.$emit('page-change', page);
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
