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
import { memoizeAdvanced } from '@/utils';

const searchProps = ['id', 'name', 'filter', 'categories'];
let iconSearchIndex = [];

const getIconSearchIndex = memoizeAdvanced((iconPack) => {
  const { icons } = iconPack;
  return icons.map((icon) => {
    let toSearch = [];
    for (const prop of searchProps) {
      if (icon[prop]) {
        if (typeof icon[prop] === 'string') {
          toSearch.push(icon[prop]);
        } else if (Array.isArray(icon[prop])) {
          toSearch = toSearch.concat(icon[prop]);
        }
      }
    }
    return toSearch.join('|').toLowerCase();
  });
}, iconPack => iconPack.id);

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
      if (this.search) {
        return icons.filter((icon, i) => iconSearchIndex[i].includes(this.searchLowerCase));
      }
      return icons;
    },
    visibleCollection() {
      return this.visibleIcons.map(icon => ({ data: icon }));
    },
  },
  watch: {
    iconPack() {
      this.refreshIconSearchIndex();
    },
  },
  async mounted() {
    this.refreshIconSearchIndex();
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
    refreshIconSearchIndex() {
      iconSearchIndex = getIconSearchIndex(this.iconPack);
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
