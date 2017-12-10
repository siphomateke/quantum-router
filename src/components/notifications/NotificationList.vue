<template>
<div class="q-notification-list"
  :class="{'is-loading': loading}"
  style="width:400px;max-height:500px;overflow-y:scroll;">
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
      <div v-if="!loading" class="content has-text-grey has-text-centered">
        <p>
          {{ 'notifications_empty' | i18n }}
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
    'loading': Boolean,
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
