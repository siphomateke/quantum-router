<template>
  <div class="toolbar">
    <div
      v-if="checkSlot('toolbar-start')"
      class="toolbar-start">
      <slot name="toolbar-start"/>
    </div>
    <div class="toolbar-end">
      <slot name="toolbar-end"/>
    </div>
  </div>
</template>

<script>
import slotsMixin from '@/mixins/slots';

export default {
  name: 'QToolbar',
  mixins: [slotsMixin],
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
