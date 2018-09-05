<template>
  <aside class="app-drawer">
    <div>
      <div class="main">
        <div class="header drawer-item">{{ title }}</div>
        <slot/>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss">
  @import '~styles/vars.scss';
  .app-drawer {
    @media only screen and (min-width: map_get($breakpoints, 'tablet')) and (max-width: map_get($breakpoints, 'desktop')) {
      width: 3.25rem !important;
    }
    @include mq('tablet', min) {
      min-height: 100vh;
    }
    background-color: $drawer-background-color;
    .main {
      color: #6F7B7E;
      @include mq('tablet', max) {
        display: flex;
      }
      .drawer-item {
        display: block;
        padding: 1em;
        height:3.25rem;
        color: $drawer-item-color;
        &.link.active {
          background: $drawer-item-active-background-color;
          color: $drawer-item-active-color;
          @include mq('tablet', min) {
            border-left: 2px solid $primary;
          }
          @include mq('tablet', max) {
            border-bottom: 2px solid $primary;
          }
        }
        &.link:hover {
          background: $drawer-item-hover-background-color;
        }
        &.header {
          background-color: $primary;
          color: $drawer-header-color;
        }
        .icon {
          display: inline-block;
          @include mq('desktop', min) {
            padding-right: 30px;
          }
        }
        .name {
          font-size: 12px;
          font-weight: bold;
        }
      }

      @include mq('desktop', max) {
        text-align: center;
        .drawer-item {
          &.header {display: none;}
          .name {display: none;}
        }
      }
    }
  }
</style>
