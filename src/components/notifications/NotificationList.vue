<template>
<div class="q-notification-list" style="width:400px;max-height:500px;overflow-y:scroll;">
  <template v-if="list.length>0">
    <template v-for="(n, key) in list">
      <notification :key="key"
      :title="n.title"
      :message="n.message"
      :date="n.date"
      :progress="n.progress"
      ></notification>
    </template>
  </template>
  <template class="content" v-else>
    <section class="section">
      <div class="content has-text-grey has-text-centered">
        <p>
          No notifications
        </p>
      </div>
    </section>
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
