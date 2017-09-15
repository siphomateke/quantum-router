<template>
  <div class="toolbar">
    <div class="toolbar-start" v-if="checkSlot('toolbar-start')">
      <slot name="toolbar-start"></slot>
    </div>
    <div class="toolbar-end">
      <slot name="toolbar-end"></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'q-toolbar',
    data() {
      return { };
    },
    methods: {
      checkSlot: function(slotName) {
        return typeof this.$slots[slotName] !== 'undefined';
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
  body {
    background-color: $primary;
  }
  .toolbar{
    display: flex;
    min-height: 3.25rem;
    background: $toolbar-background-color;
    color: $toolbar-item-color;
    border-bottom: 2px solid $toolbar-border-color;

    .toolbar-start {
      justify-content: flex-start;
      align-items: center;
      display: flex;
    }

    .toolbar-end {
      justify-content: flex-end;
      align-items: center;
      display: flex;
      margin-left: auto;
    }
  }
</style>
