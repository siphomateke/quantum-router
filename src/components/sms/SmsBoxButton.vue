<template>
  <div class='control'>
    <button class="button" :class="type" @click="click" :disabled="disabled">
      <b-icon v-if="icon" :icon="icon"></b-icon>
      <span v-if="label">{{label}}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'sms-box-button',
  props: {
    'type': String,
    'icon': String,
    'label': String,
    'disabled': Boolean,
  },
  methods: {
    click(...args) {
      this.$emit('click', args);
    },
  },
};
</script>
