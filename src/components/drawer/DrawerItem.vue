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
    link: String,
    icon: String,
    label: String,
  },
};
</script>
