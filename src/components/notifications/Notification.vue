<template>
<div class="q-notification">
  <span class="q-title">{{ title }}</span>
  <span class="q-subtitle"><time :datetime="machineDate">{{ time }}</time></span>
  <div class="q-message">{{ message }}</div>
  <progress v-if="progress" class="progress is-primary is-small" :value="progress" max="1">{{progress * 100}}%</progress>
</div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'q-notification',
  props: {
    title: String,
    message: String,
    date: Number,
    read: Boolean,
    progress: Number,
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
    machineDate() {
      return moment(this.date).format('Y-M-D HH:mm:ss');
    },
    time() {
      if (this._date) {
        const duration = moment.duration(Date.now() - this.date);
        if (duration.asMinutes() <= 30) {
          return this._date.fromNow();
        } else if (duration.asDays() < 1) {
          return this._date.format('HH:mm');
        } else {
          return this._date.format('Y-M-D HH:mm');
        }
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
