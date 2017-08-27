<template>
  <router-link :to="{ name: link }" class="toolbar-item" :class="{'active': isActive}">
    <b-icon v-if="icon" pack="fa" :icon="icon" class="fa-fw"></b-icon> {{ label }}
    <slot></slot>
  </router-link>
</template>

<script>
  export default {
    props: {
      'icon': String,
      'label': String,
      'isActive': Boolean,
      'link': String
    }
  }
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';

.toolbar-item{
  position: relative;
  padding: 0.5rem 1rem;
  align-items: center;
  display: flex;
  line-height: 1.5;
  position: relative;
  color: $toolbar-item-color;

  &:hover{
    color: $toolbar-item-hover-color;
  }

  &.active {
    color: $toolbar-item-active-color;
  }
}
</style>
