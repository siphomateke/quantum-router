<template>
  <div class="topbar-wrapper">
    <div class="topbar">
      <div class="topbar-left"/>
      <div class="topbar-right">
        <button
          class="button is-inverted"
          title="Toggle sidebar"
          @click="$emit('toggleSidebar')">
          <b-icon icon="bars"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Toolbar from './toolbar/Toolbar.vue';

export default {
  name: 'TheTopbar',
  components: {
    Toolbar,
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';

.topbar-wrapper {
  z-index: 10;
}

.topbar {
  display: flex;
  box-shadow: 0 0 10px rgba(0,0,0,0.6);
  padding: 0.5em;
  background: $topbar-background-color;

  .topbar-right {
    flex-grow: 1;
  }
}
</style>
