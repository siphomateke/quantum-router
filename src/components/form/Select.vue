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
    name: 'qSelect',
    data() { return {
      selected: this.value,
    };},
    props: {
        'label': String,
        'value': {
            type: [String, Number, Boolean, Object, Array, Symbol, Function],
            default: null
        },
        'options': {
          type: Array,
          default: []
        }
    },
    watch:{
      selected(value) {
        this.$emit('input', value)
      }
    }
  }
</script>
