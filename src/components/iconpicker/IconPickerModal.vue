<template>
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">{{ title }}</p>
    <b-field>
      <b-input
        ref="search"
        :value="search"
        @input="searchChange"
        placeholder="Search (en)"
        type="search"
        icon="search">
      </b-input>
    </b-field>
  </header>
  <b-tabs v-model="activeTab" class="modal-card-tabs">
    <b-tab-item
      v-for="iconPack in iconPacks"
      :key="iconPack.id"
      :label="iconPack.name">
      <button
        type="button"
        class="button is-white"
        v-for="icon in (search.length > 0 ? visibleIcons : iconPack.icons)"
        :key="icon.id"
        :class="{'is-primary': icon.id === value}"
        @click="() => select(icon.id, iconPack.id, icon.name)"
        :title="icon.name">
        <b-icon :icon="icon.id"></b-icon>
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
  name: 'q-icon-picker-modal',
  props: {
    iconPacks: Array,
    value: Object,
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
      const icons = this.iconPacks[this.activeTab].icons;
      if (this.search && this.search.length > 0) {
        return icons.filter(icon => {
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
      } else {
        return icons;
      }
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
      this.$emit('input', {id, pack, name});
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
