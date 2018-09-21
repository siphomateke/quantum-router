<template>
  <div class="icon-list">
    <button
      v-for="icon in visibleIcons"
      :key="icon.id"
      :class="{'is-primary': icon.id === value.id, 'is-transparent': icon.id !== value.id}"
      :title="icon.name"
      type="button"
      class="button"
      @click="select(icon)">
      <b-icon
        :pack="iconPack.id"
        :icon="icon.id"/>
    </button>
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
                const regex = new RegExp(this.searchLowerCase);
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
  },
  methods: {
    select(icon) {
      this.$emit('select', {
        id: icon.id,
        name: icon.name,
        pack: this.iconPack.id,
      });
    },
  },
};
</script>
