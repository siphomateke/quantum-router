<template>
  <div
    ref="wrapper"
    class="icon-list">
    <VirtualCollection
      v-if="collectionWidth > 0 && collectionHeight > 0"
      ref="virtualCollection"
      :cell-size-and-position-getter="cellSizeAndPositionGetter"
      :collection="visibleCollection"
      :width="collectionWidth"
      :height="collectionHeight"
      class="icon-list-virtual-collection">
      <button
        slot="cell"
        slot-scope="{data: icon}"
        :class="{'is-primary': icon.id === value.id, 'is-transparent': icon.id !== value.id}"
        :title="icon.name"
        type="button"
        class="button is-large"
        @click="select(icon)">
        <b-icon
          :pack="iconPack.id"
          :icon="icon.id"
          custom-class="mdi-36px"/>
      </button>
    </VirtualCollection>
  </div>
</template>

<script>
import { selectedIcon } from './props';

export default {
  props: {
    iconPack: {
      type: Object,
      default: null,
      validator(value) {
        return Array.isArray(value.icons)
            && typeof value.id === 'string'
            && typeof value.name === 'string';
      },
    },
    search: {
      type: String,
      default: '',
    },
    value: selectedIcon,
  },
  data() {
    return {
      collectionWidth: 0,
      collectionHeight: 0,
    };
  },
  computed: {
    searchLowerCase() {
      return this.search.toLowerCase();
    },
    visibleIcons() {
      const { icons } = this.iconPack;
      if (this.search && this.search.length > 0) {
        return icons.filter((icon) => {
          const toMatch = ['id', 'name', 'filter', 'categories'];
          for (const prop of toMatch) {
            if (icon[prop]) {
              if (typeof icon[prop] === 'string' && icon[prop].toLowerCase().includes(this.searchLowerCase)) {
                return true;
              } else if (Array.isArray(icon[prop])) {
                const regex = new RegExp(this.searchLowerCase, 'i');
                const match = regex.test(icon[prop].join('|'));
                if (match) {
                  return true;
                }
              }
            }
          }
          return false;
        });
      }
      return icons;
    },
    visibleCollection() {
      return this.visibleIcons.map(icon => ({ data: icon }));
    },
  },
  async mounted() {
    this.$nextTick(() => {
      this.onWindowResize();
      window.addEventListener('resize', this.onWindowResize);
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    select(icon) {
      this.$emit('select', {
        id: icon.id,
        name: icon.name,
        pack: this.iconPack.id,
      });
    },
    cellSizeAndPositionGetter(item, index) {
      const cellSize = 54;
      const cellPadding = 0;
      const containerPadding = 10;
      const cols = Math.round((this.collectionWidth - containerPadding * 2) / (cellSize + cellPadding));
      return {
        width: cellSize,
        height: cellSize,
        x: ((index % cols) * (cellSize + cellPadding)) + containerPadding,
        y: (parseInt(index / cols) * (cellSize + cellPadding)) + containerPadding,
      };
    },
    onWindowResize() {
      this.collectionWidth = this.$refs.wrapper.clientWidth;
      this.collectionHeight = this.$refs.wrapper.clientHeight;
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-list {
  height: 400px;

  .vue-virtual-collection {
    overflow-x: auto;
  }
}
</style>
