<template>
  <div class="toolbar">
    <div class="toolbar-start" v-if="checkSlot('toolbar-start')">
      <slot name="toolbar-start"></slot>
    </div>
    <div class="toolbar-end">
      <slot name="toolbar-end"></slot>
      <q-toolbar-item v-for="item in items" :key="item.id" :isActive="item.isActive" :icon="item.icon" :label="item.label"></q-toolbar-item>
    </div>
  </div>
</template>

<script>
  import ToolbarItem from '@/components/ToolbarItem.vue';
  export default {
    data() { return { }; },
    props: {
      items: Array
    },
    methods: {
      checkSlot: function (slotName) {
        return typeof this.$slots[slotName] !== 'undefined';
      }
    },
    components: {
      'q-toolbar-item': ToolbarItem
    }
  }
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
