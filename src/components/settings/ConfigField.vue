<template>
<div class="config-field">
  <div class="columns">
    <div class="column is-3">
      <h6 class="title is-6">{{ label }}</h6>
      <h6 class="subtitle is-6" v-if="description">{{ description }}</h6>
    </div>
    <div class="column">
      <slot></slot>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    label: String,
    description: String,
  },
};
</script>

<style lang="scss" scoped>
  .config-field {
    border-bottom: 2px solid whitesmoke;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
