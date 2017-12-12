<template>
  <div class="sms-list">
    <b-table
    :data="list"
    :bordered="false"
    :striped="true"
    :narrowed="true"
    :loading="loading"
    :mobile-cards="true"
    :checked-rows.sync="checkedRows"
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
          <b-table-column field="read">
            <b-icon :icon="props.row.read ? 'envelope-open-o' : 'envelope'"></b-icon>
          </b-table-column>
          <b-table-column label="Number" field="number">{{ props.row.number }}</b-table-column>
          <b-table-column label="Content" field="content">
            <div class="content">{{ props.row.content }}</div>
          </b-table-column>
          <b-table-column field="date" label="Date" sortable centered>
            <span style="white-space:nowrap;">{{ formatDate(props.row.date) }}</span>
          </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <template v-if="!loading">
            <p>There are no SMSs</p>
          </template>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
import moment from 'moment';
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
  },
  methods: {
    formatDate(date) {
      return moment(date).format('Y-M-D H:mm:ss');
    },
    onPageChange(page) {
      this.$emit('page-change', page);
    },
    onSort(field, order) {
      this.$emit('sort', order);
    },
  },
};
</script>
