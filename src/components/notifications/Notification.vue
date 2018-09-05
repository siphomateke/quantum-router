<template>
  <div class="q-notification">
    <span class="q-title">{{ title }}</span>
    <span class="q-subtitle"><time :datetime="machineDate">{{ time }}</time></span>
    <div class="q-message">{{ message }}</div>
    <progress
      v-if="progress"
      :value="progress"
      class="progress is-primary is-small"
      max="1">{{ progress * 100 }}%</progress>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'QNotification',
  props: {
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    date: {
      type: Number,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 1,
    },
  },
  data() {
    return {
      _date: null,
    };
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
  watch: {
    date(date) {
      this.updateDate(date);
    },
  },
  created() {
    this.updateDate(this.date);
  },
  methods: {
    updateDate(date) {
      if (date) {
        this._date = moment(date);
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
