<template>
  <div class="config-field">
    <div class="columns">
      <div class="column is-5">
        <h6 class="title is-6">{{ label }}</h6>
        <h6
          v-if="description"
          class="subtitle is-6">{{ description }}</h6>
      </div>
      <div class="column">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
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
