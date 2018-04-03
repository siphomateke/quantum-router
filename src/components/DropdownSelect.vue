<template>
<div>
  <slot></slot>
</div>
</template>

<script>
export default {
  name: 'q-dropdown-select',
  props: ['value'],
  data() {
    return {
      selected: null,
    };
  },
  watch: {
    value(value) {
      this.selected = value;
    },
  },
  methods: {
    selectItem(value) {
      this.selected = value;
      this.$emit('input', value);
      this.$emit('change', value);
      this.$parent.toggle();
    },
  },
};
</script>
