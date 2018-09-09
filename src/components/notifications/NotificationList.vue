<template>
  <div
    :class="{'is-loading': loading}"
    class="q-notification-list"
    style="width:400px;max-height:500px;overflow-y:scroll;">
    <template v-if="list.length>0">
      <notification
        v-for="(n, key) in list"
        :key="key"
        :title="n.title"
        :message="n.message"
        :date="n.date"
        :read="n.read"
        :progress="n.progress"
      />
    </template>
    <template
      v-else
      class="content">
      <section class="section">
        <div
          v-if="!loading"
          class="content has-text-grey has-text-centered">
          <p>
            {{ $i18n('notifications.empty') }}
          </p>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import Notification from './Notification.vue';

export default {
  name: 'QNotificationList',
  components: {
    notification: Notification,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
  @import "~bulma/sass/utilities/mixins";

  .q-notification-list.is-loading {
    position: relative;
    pointer-events: none;
    opacity: 0.5;
    &:after {
      @include loader;
      position: absolute;
      top: calc(50% - 2.5em);
      left: calc(50% - 2.5em);
      width: 5em;
      height: 5em;
      border-width: 0.25em;
    }
  }
</style>
