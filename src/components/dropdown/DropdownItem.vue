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
  name: 'DropdownItem',
  props: {
    value: {
      type: [String, Number, Boolean, Object, Array, Symbol, Function],
      default: null,
    },
  },
  methods: {
    click() {
      this.$parent.selectItem(this.value);
      this.$emit('click');
    },
  },
};
</script>
