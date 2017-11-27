<template>
<div class="q-notification">
  <span class="q-title">{{ title }}</span>
  <span class="q-subtitle">{{ dateFromNow }}</span>
  <div class="q-message">{{ message }}</div>
  <progress v-if="progress" class="progress is-primary is-small" :value="progress" max="1">{{progress * 100}}%</progress>
</div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'q-notification',
  props: {
    'title': String,
    'message': String,
    'date': String,
    'progress': Number,
  },
  data() {
    return {
      _date: null,
    };
  },
  created() {
    this.updateDate(this.date);
  },
  watch: {
    date(date) {
      this.updateDate(date);
    },
  },
  methods: {
    updateDate(date) {
      if (date) {
        this._date = moment(date);
      }
    },
  },
  computed: {
    dateFromNow() {
      if (this.date) {
        return this._date.fromNow();
      } else {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';

  .q-notification{
    border-bottom: 1px solid #eee;
    padding:0.5em 1em;

    .q-title{
      font-weight: bold;
      font-size: 1em;
    }

    .q-subtitle {
      font-size: 1em;
      color: #7f7f7f;
      float: right;
    }

    .q-message{

    }
  }
</style>
