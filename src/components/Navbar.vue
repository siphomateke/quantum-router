<template>
<nav class="navbar has-shadow">
  <div class="navbar-brand">
    <slot name="navbar-brand"></slot>

    <span class="navbar-burger" @click="navToggle" :class="{'is-active': isActive}">
      <span></span>
      <span></span>
      <span></span>
    </span>
  </div>
  <div class="navbar-menu" :class="{'is-active': isActive}">
    <div class="navbar-start" v-if="checkSlot('navbar-start')">
      <slot name="navbar-start"></slot>
    </div>
    <div class="navbar-end">
      <slot name="navbar-end"></slot>
      <a v-for="item in items" class="navbar-item" :href="item.link" :class="{'is-active': item.isActive}">
        <b-icon v-if="item.icon" pack="fa" :icon="item.icon" class="fa-fw"></b-icon> {{ item.label }}
      </a>
    </div>
  </div>
</nav>
</template>

<script>
  export default {
    data() {
      return {
        isActive: false
      };
    },
    props:{
      items: Array
    },
    methods:{
      checkSlot: function (slotName) {
        return typeof this.$slots[slotName] !== 'undefined';
      },
      navToggle: function() {
        this.isActive = !this.isActive;
      }
    }
  }
</script>

<style lang="scss">
  @import '~styles/vars.scss';
  .navbar{
    z-index: 2;
  }
  .navbar-offset{
    margin-left: 16.6666667%;
  }
</style>
