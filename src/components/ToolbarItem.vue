<template>
  <router-link v-if="!checkSlot('dropdown')" :to="{ name: link }" class="toolbar-item" :class="{'active': isActive}" :style="{color: color}">
    <b-icon v-if="icon" pack="fa" :icon="icon" class="fa-fw"></b-icon> {{ label }}
    <div class="badge" v-if="badgeVisible">{{ badge }}</div>
    <slot></slot>
  </router-link>
  <b-dropdown
  v-else
  :value="value"
  @input="input"
  ref="dropdown"
   class="toolbar-item" :class="{'active': isActive}">
    <router-link slot="trigger" :to="{ name: link }" :style="{color: color}">
      <b-icon v-if="icon" pack="fa" :icon="icon" class="fa-fw"></b-icon> {{ label }}
      <div class="badge" v-if="badgeVisible">{{ badge }}</div>
      <slot></slot>
    </router-link>
    <slot name="dropdown"></slot>
  </b-dropdown>
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
      'color': String,
      'value': {},
    },
    methods: {
      checkSlot(slotName) {
        return typeof this.$slots[slotName] !== 'undefined';
      },
      input(value) {
        this.$emit('input', value);
      },
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
