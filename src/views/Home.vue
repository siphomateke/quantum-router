<template>
<div class="page-content">
  <h2 class="title is-2">Overview</h2>
  <div class="nav menu">
    <div class="container">
      <div class="nav-left">
        <a class="nav-item is-tab is-active">
          <b-icon pack="fa" icon="home"></b-icon>
        </a>
        <a class="nav-item is-tab">
          <b-icon pack="fa" icon="home"></b-icon>
        </a>
      </div>
      <div class="nav-right is-hidden-mobile">
        <a class="nav-item is-tab">Name</a>
        <a class="nav-item is-tab">Size</a>
        <a class="nav-item is-tab">Views</a>
        <a class="nav-item"><span class=" button is-success">Uploaded</span></a>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <section class="section">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <section class="section">
      <button class="button is-primary">Click me!</button>
    </section>
  </section>
</div>
</template>

<script>
 export default {
   data() { return { }; }
 }
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
