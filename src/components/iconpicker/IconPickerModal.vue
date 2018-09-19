<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ title }}</p>
      <b-field>
        <b-input
          ref="search"
          :value="search"
          placeholder="Search (en)"
          type="search"
          icon="search"
          @input="searchChange"/>
      </b-field>
    </header>
    <b-tabs
      v-model="activeTab"
      class="modal-card-tabs">
      <b-tab-item
        v-for="iconPack in iconPacks"
        :key="iconPack.id"
        :label="iconPack.name">
        <button
          v-for="icon in (search.length > 0 ? visibleIcons : iconPack.icons)"
          :key="icon.id"
          :class="{'is-primary': icon.id === value.id}"
          :title="icon.name"
          type="button"
          class="button is-white"
          @click="() => select(icon.id, iconPack.id, icon.name)">
          <b-icon
            :pack="iconPack.id"
            :icon="icon.id"/>
        </button>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
// FIXME: tab change animation lag
// TODO: Only show tabs if there is more than one iconPack
// TODO: Don't remake modal everytime it's opened, use a global instance
export default {
  name: 'IconPickerModal',
  props: {
    iconPacks: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default() {
        return {
          id: '',
          pack: '',
        };
      },
      validator(value) {
        return typeof value.id === 'string'
            && typeof value.pack === 'string';
      },
    },
    title: {
      type: String,
      default: 'Choose an icon',
    },
  },
  data() {
    return {
      activeTab: 0,
      search: '',
    };
  },
  computed: {
    visibleIcons() {
      const { icons } = this.iconPacks[this.activeTab];
      if (this.search && this.search.length > 0) {
        return icons.filter((icon) => {
          const toMatch = ['id', 'name', 'filter', 'categories'];
          for (const prop of toMatch) {
            if (icon[prop]) {
              if (typeof icon[prop] === 'string' && icon[prop].toLowerCase().includes(this.search)) {
                return true;
              } else if (Array.isArray(icon[prop])) {
                const regex = new RegExp(this.search, 'i');
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
  mounted() {
    this.$refs.search.focus();
  },
  methods: {
    searchChange(value) {
      this.search = value.toLowerCase();
    },
    select(id, pack, name) {
      this.$emit('input', { id, pack, name });
      if ('close' in this.$parent && typeof this.$parent.close === 'function') {
        this.$parent.close();
      }
    },
  },
};
</script>

<style lang="scss">
  .modal-card-tabs.b-tabs {
    background-color: white;
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .tab-content {
      overflow: auto;
    }
  }
</style>
