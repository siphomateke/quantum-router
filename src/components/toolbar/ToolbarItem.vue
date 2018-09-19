<template>
  <router-link
    v-if="!checkSlot('dropdown')"
    :to="{ name: link }"
    :class="{'active': isActive}"
    :style="{color: color}"
    class="toolbar-item button is-inverted">
    <div
      :data-badge="badgeVisible ? badge : false"
      :class="{badge: badgeVisible}">
      <b-icon
        v-if="icon"
        :icon="icon"
        pack="fa"
        class="fa-fw"/>
      {{ label }}
    </div>
    <slot/>
  </router-link>
  <b-dropdown
    v-else
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
      class="toolbar-item-trigger button is-inverted">
      <div
        :data-badge="badgeVisible ? badge : false"
        :class="{badge: badgeVisible}">
        <b-icon
          v-if="icon"
          :icon="icon"
          pack="fa"
          class="fa-fw"/>
        {{ label }}
      </div>
      <slot/>
    </router-link>
    <slot name="dropdown"/>
  </b-dropdown>
</template>

<script>
import slotsMixin from '@/mixins/slots';

export default {
  name: 'QToolbarItem',
  mixins: [slotsMixin],
  props: {
    icon: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
    badgeVisible: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: [Number, String],
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number, Boolean, Object, Array, Symbol, Function],
      default: null,
    },
    position: {
      type: String,
      default: 'is-bottom-left',
    },
    mobileModal: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    input(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';

.button.toolbar-item{
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
