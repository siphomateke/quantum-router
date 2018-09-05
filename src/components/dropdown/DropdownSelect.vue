<template>
  <div>
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'QDropdownSelect',
  props: {
    value: {
      type: [String, Number, Boolean, Object, Array, Symbol, Function],
      default: null,
    },
  },
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
