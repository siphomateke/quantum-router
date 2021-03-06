<template>
  <div class="q-notification">
    <span class="notification-title">{{ title }}</span>
    <span class="notification-subtitle"><time :datetime="machineDate">{{ time }}</time></span>
    <div class="notification-message">{{ message }}</div>
    <progress
      v-if="progress"
      :value="progress"
      class="progress is-primary is-small"
      max="1">{{ progress * 100 }}%</progress>
  </div>
</template>

<script>
import moment from 'moment';
import { momentFormat } from '@/utils';

export default {
  name: 'Notification',
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
      internalDate: null,
    };
  },
  computed: {
    machineDate() {
      return momentFormat(this.date, 'Y-M-D HH:mm:ss');
    },
    time() {
      if (this.internalDate) {
        const duration = moment.duration(Date.now() - this.date);
        if (duration.asMinutes() <= 30) {
          return this.internalDate.fromNow();
        } else if (duration.asDays() < 1) {
          return this.internalDate.format('HH:mm');
        }
        return this.internalDate.format('Y-M-D HH:mm');
      }
      return null;
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
        this.internalDate = moment(date);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .q-notification{
    border-bottom: 1px solid #eee;
    padding:0.5em 1em;

    .notification-title{
      font-weight: bold;
      font-size: 1em;
    }

    .notification-subtitle {
      font-size: 1em;
      color: #7f7f7f;
      float: right;
    }
  }
</style>
