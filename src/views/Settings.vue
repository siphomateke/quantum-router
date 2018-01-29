<template>
<div class="page-content">
  <div class="card">
    <nav class="navbar has-shadow">
      <div class="container">
        <div class="navbar-brand">
          <router-link v-for="item in nav" :key="item.name" class="navbar-item is-tab" active-class="is-active" tag="a" :to="{ name: item.name }">
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <router-view></router-view>

  </div>
</div>
</template>

<script>

export default {
  data() {
    return {
      nav: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // console.log(this.$route.name);  //should return object
      // console.log(this.$router); //should return id of URL param
      let children = [];
      for (const route of this.$router.options.routes) {
        if (this.$route.matched[0].name === route.name) {
          children = route.children;
          break;
        }
      }
      for (const child of children) {
        this.nav.push({name: child.name, label: child.label});
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';
</style>
