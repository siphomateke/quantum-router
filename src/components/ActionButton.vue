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
    type: String,
    icon: String,
    label: String,
    disabled: Boolean,
    loading: Boolean,
  },
  methods: {
    click(...args) {
      this.$emit('click', args);
    },
  },
};
</script>
