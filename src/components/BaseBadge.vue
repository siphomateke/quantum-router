<template>
  <div
    :data-badge="visible ? content : false"
    :class="{badge: visible}">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'BaseBadge',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    content: {
      type: [Number, String],
      default: '',
    },
  },
};
</script>
