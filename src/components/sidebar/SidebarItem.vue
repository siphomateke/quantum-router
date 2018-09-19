<template>
  <router-link
    :to="{ name: link }"
    :title="label"
    class="sidebar-item link"
    active-class="active"
    @click.native="$emit('click')">
    <b-icon
      v-if="icon"
      :icon="icon"
      pack="fa"
      class="fa-fw"/>
    <span class="name text-after-icon">{{ label }}</span>
  </router-link>
</template>

<script>
export default {
  name: 'SidebarItem',
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
