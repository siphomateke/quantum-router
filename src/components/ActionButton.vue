<template>
  <div class='control'>
    <button
    class="button"
    :class="[type, loading ? 'is-loading' : null]"
    @click="click"
    :disabled="disabled">
      <b-icon v-if="icon" :icon="icon"></b-icon>
      <span>{{label}}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'action-button',
  props: {
    'type': String,
    'icon': String,
    'label': String,
    'disabled': Boolean,
    'loading': Boolean,
  },
  methods: {
    click(...args) {
      this.$emit('click', args);
    },
  },
};
</script>
