<template>
<div class="sms-list">
  <b-table
  :data="list"
  :bordered="true"
  :striped="false"
  :narrowed="false"
  :loading="loading"
  :mobile-cards="true"
  :checked-rows.sync="checkedRows"
  checkable>
    <template slot-scope="props">
        <b-table-column>{{ props.row.read }}</b-table-column>
        <b-table-column label="Number">{{ props.row.number }}</b-table-column>
        <b-table-column label="Content">
          <div class="content">{{ props.row.content }}</div>
        </b-table-column>
        <b-table-column width="120" field="date" label="Date" sortable centered>{{ formatDate(props.row.date) }}</b-table-column>
    </template>

    <template slot="empty">
      <section class="section">
        <p class="content">Error finding messages</p>
      </section>
    </template>
  </b-table>
</div>
</template>

<script>
import moment from 'moment';
export default {
  data() {
    return {

    };
  },
  props: {
    'list': Array,
    'checked-rows': Array,
    'loading': {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatDate(date) {
      return moment(date).fromNow();
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
