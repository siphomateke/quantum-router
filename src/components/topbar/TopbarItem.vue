<template>
  <div
    :class="{'active': isActive}"
    :style="{color: color}"
    class="topbar-item button is-transparent is-inverted">
    <BaseBadge
      :content="badge"
      :visible="badgeVisible">
      <b-icon
        v-if="icon"
        :icon="icon"
        pack="fa"
        class="fa-fw"/>
      <span v-if="label">{{ label }}</span>
    </BaseBadge>
  </div>
</template>

<script>
import slotsMixin from '@/mixins/slots';
import BaseBadge from '@/components/BaseBadge.vue';

export default {
  name: 'TopbarItem',
  components: {
    BaseBadge,
  },
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
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';

.button.topbar-item.active {
  color: $topbar-item-active-color;
}
</style>
