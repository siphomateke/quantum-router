<template>
  <nav class="navbar has-shadow">
    <div class="navbar-brand">
      <slot name="navbar-brand"/>

      <span
        :class="{'is-active': isActive}"
        class="navbar-burger"
        @click="navToggle">
        <span/>
        <span/>
        <span/>
      </span>
    </div>
    <div
      :class="{'is-active': isActive}"
      class="navbar-menu">
      <div
        v-if="checkSlot('navbar-start')"
        class="navbar-start">
        <slot name="navbar-start"/>
      </div>
      <div class="navbar-end">
        <slot name="navbar-end"/>
        <a
          v-for="item in items"
          :key="item.link"
          :href="item.link"
          :class="{'is-active': item.isActive}"
          class="navbar-item">
          <b-icon
            v-if="item.icon"
            :icon="item.icon"
            pack="fa"
            class="fa-fw"/> {{ item.label }}
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    items: Array,
  },
  data() {
    return {
      isActive: false,
    };
  },
  methods: {
    checkSlot: function(slotName) {
      return typeof this.$slots[slotName] !== 'undefined';
    },
    navToggle: function() {
      this.isActive = !this.isActive;
    },
  },
};
</script>

<style lang="scss" scoped>
  .navbar{
    z-index: 2;
  }
  .navbar-offset{
    margin-left: 16.6666667%;
  }
</style>
