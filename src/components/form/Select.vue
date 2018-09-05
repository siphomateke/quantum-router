<template>
  <b-field :label="label">
    <b-select v-model="selected">
      <option
        v-for="option in options"
        :value="option.value"
        :key="option.value">
        {{ option.label }}
      </option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  name: 'QSelect',
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number, Boolean, Object, Array, Function],
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selected: this.value,
    };
  },
  watch: {
    selected(value) {
      this.$emit('input', value);
    },
  },
};
</script>
