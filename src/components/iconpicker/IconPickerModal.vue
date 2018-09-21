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
        <IconPickerIconList
          :search="search"
          :icon-pack="iconPack"
          :value="value"
          @select="select"/>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import { selectedIcon } from './props';
import IconPickerIconList from './IconPickerIconList.vue';

// FIXME: tab change animation lag
// TODO: Only show tabs if there is more than one iconPack
// TODO: Don't remake modal everytime it's opened, use a global instance
export default {
  name: 'IconPickerModal',
  components: {
    IconPickerIconList,
  },
  props: {
    iconPacks: {
      type: Array,
      default: () => [],
    },
    value: selectedIcon,
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
  mounted() {
    this.$refs.search.focus();
  },
  methods: {
    searchChange(value) {
      this.search = value;
    },
    select({ id, pack, name }) {
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
