<template>
<div class="page-content">
  <div class="card">

    <div class="hero is-primary">
      <div class="hero-body">
        <h1 class="title">Settings</h1>
      </div>
      <div class="hero-foot">
        <nav class="tabs is-boxed">
          <ul>
            <router-link v-for="item in nav" :key="item.name" active-class="is-active" tag="li" :to="{ name: item.name }">
              <a>{{ item.label }}</a>
            </router-link>
            <!-- <router-link :to="{ name: 'settings/wlan' }">WLAN</router-link> -->
            <!-- <li><a>System</a></li> -->
          </ul>
        </nav>
      </div>
    </div>

    <router-view></router-view>

    <!--<div>
      <b-tabs type="is-boxed" v-model="currentTab">
        <b-tab-item label="Mobile connection"></b-tab-item>
        <b-tab-item label="WLAN"></b-tab-item>
        <b-tab-item label="System"></b-tab-item>
      </b-tabs>
    </div>-->

  </div>
</div>
</template>

<script>

export default {
  data() {
    return {
      nav: []
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
      for (let route of this.$router.options.routes) {
        if (this.$route.matched[0].name === route.name) {
          children = route.children;
          break;
        }
      }
      for (let child of children) {
        this.nav.push({name: child.name, label: child.label});
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';
</style>
