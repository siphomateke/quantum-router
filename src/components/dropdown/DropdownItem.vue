<template>
  <a
    :class="{'is-active' : value !== null && value === $parent.value}"
    class="dropdown-item"
    @click="click" >
    <slot/>
  </a>
</template>

<script>
export default {
  name: 'QDropdownItem',
  props: ['value'],
  methods: {
    click() {
      this.$parent.selectItem(this.value);
      this.$emit('click');
    },
  },
};
</script>
