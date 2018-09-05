<template>
  <router-link
    :to="{ name: link }"
    class="drawer-item link"
    active-class="active">
    <b-icon
      v-if="icon"
      :icon="icon"
      pack="fa"
      class="fa-fw"/>
    <span class="name">{{ label }}</span>
  </router-link>
</template>

<script>
export default {
  props: {
    link: {
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
  },
};
</script>
