<template>
  <div class="control">
    <button
      :class="[type, loading ? 'is-loading' : null]"
      :disabled="disabled"
      class="button"
      @click="click">
      <b-icon
        v-if="icon"
        :icon="icon"/>
      <span v-if="label">{{ label }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ActionButton',
  props: {
    type: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    click(...args) {
      this.$emit('click', args);
    },
  },
};
</script>
