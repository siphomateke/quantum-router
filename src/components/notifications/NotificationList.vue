<template>
<div class="q-notification-list" style="width:400px;max-height:500px;overflow-y:scroll;">
  <template v-for="(n, key) in list">
    <notification :key="key"
    :title="n.title"
    :message="n.message"
    :date="n.date"
    :progress="n.progress"
    ></notification>
  </template>
</div>
</template>

<script>
import Notification from './Notification';
export default {
  name: 'q-notification-list',
  components: {
    'notification': Notification,
  },
  props: {
    'list': Array,
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
