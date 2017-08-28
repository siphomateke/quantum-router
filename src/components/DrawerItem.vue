<template>
<router-link class="drawer-item link" :to="{ name: link }" active-class="active">
  <b-icon v-if="icon" pack="fa" :icon="icon" class="fa-fw"></b-icon>
  <span class="name">{{ label }}</span>
</router-link>
</template>

<script>
  export default {
    props: {
      'link': String,
      'icon': String,
      'label': String,
    }
 }
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
