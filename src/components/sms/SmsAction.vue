<template>
  <div class='control'>
    <button class="button" :class="type" @click="click">
      <b-icon v-if="icon" :icon="icon"></b-icon>
      <span>{{label}}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'sms-action',
  props: {
    'type': String,
    'icon': String,
    'label': String,
  },
  methods: {
    click(...args) {
      this.$emit('click', args);
    },
  },
};
</script>
