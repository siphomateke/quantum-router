<template>
  <router-link :to="{ name: link }" class="toolbar-item" :class="{'active': isActive}">
    <b-icon v-if="icon" pack="fa" :icon="icon" class="fa-fw"></b-icon> {{ label }}
    <div class="badge" v-if="badgeVisible">{{ badge }}</div>
    <slot></slot>
  </router-link>
</template>

<script>
  export default {
    name: 'q-toolbar-item',
    props: {
      'icon': String,
      'label': String,
      'isActive': {
        type: Boolean,
        default: false,
      },
      'link': String,
      'badgeVisible': {
        type: Boolean,
        default: false,
      },
      'badge': [Number, String],
    },
  };
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
