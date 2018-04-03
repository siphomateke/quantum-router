<template>
<a class="dropdown-item"
  @click="click"
  :class="{'is-active' : value !== null && value === $parent.value}" >
  <slot></slot>
</a>
</template>

<script>
export default {
  name: 'q-dropdown-item',
  props: ['value'],
  methods: {
    click() {
      this.$parent.selectItem(this.value);
      this.$emit('click');
    },
  },
};
</script>
