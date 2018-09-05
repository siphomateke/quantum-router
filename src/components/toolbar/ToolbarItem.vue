<template>
  <router-link
    v-if="!checkSlot('dropdown')"
    :to="{ name: link }"
    :class="{'active': isActive}"
    :style="{color: color}"
    class="toolbar-item">
    <b-icon
      v-if="icon"
      :icon="icon"
      pack="fa"
      class="fa-fw"/> {{ label }}
    <div
      v-if="badgeVisible"
      class="badge">{{ badge }}</div>
    <slot/>
  </router-link>
  <b-dropdown
    v-else
    ref="dropdown"
    :value="value"
    :position="position"
    :mobile-modal="mobileModal"
    :class="{'active': isActive}"
    class="toolbar-item"
    @input="input">
    <router-link
      slot="trigger"
      :to="{ name: link }"
      :style="{color: color}"
      class="toolbar-item-trigger">
      <b-icon
        v-if="icon"
        :icon="icon"
        pack="fa"
        class="fa-fw"/> {{ label }}
      <div
        v-if="badgeVisible"
        class="badge">{{ badge }}</div>
      <slot/>
    </router-link>
    <slot name="dropdown"/>
  </b-dropdown>
</template>

<script>
export default {
  name: 'QToolbarItem',
  props: {
    icon: String,
    label: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    link: String,
    badgeVisible: {
      type: Boolean,
      default: false,
    },
    badge: [Number, String],
    color: String,
    value: {},
    position: String,
    mobileModal: Boolean,
  },
  methods: {
    checkSlot(slotName) {
      return typeof this.$slots[slotName] !== 'undefined';
    },
    input(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';

.toolbar-item{
  position: relative;
  padding: 0.5rem 1rem;
  align-items: center;
  display: flex;
  line-height: 1.5;
  position: relative;
  color: $toolbar-item-color;

  &:hover{
    color: $toolbar-item-hover-color;
  }

  &.active {
    color: $toolbar-item-active-color;
  }

  .toolbar-item-trigger{
    color: $toolbar-item-color;
    &:hover{
      color: $toolbar-item-hover-color;
    }

    &.active {
      color: $toolbar-item-active-color;
    }
  }
}
</style>
