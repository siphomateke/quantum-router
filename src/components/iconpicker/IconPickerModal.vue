<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ title }}</p>
      <b-field>
        <b-input
          ref="search"
          :value="search"
          :placeholder="searchPlaceholder"
          type="search"
          icon="search"
          @input="searchChange"/>
      </b-field>
    </header>
    <main class="modal-card-body">
      <div class="tabs">
        <ul>
          <li
            v-for="(iconPack, index) in iconPacks"
            :key="iconPack.id"
            :label="iconPack.name"
            :class="{'is-active': index === activeTab}">
            <a @click="activeTab = index"><span>{{ iconPack.name }}</span></a>
          </li>
        </ul>
      </div>
      <IconPickerIconList
        :search="search"
        :icon-pack="iconPacks[activeTab]"
        :value="value"
        @select="select"/>
    </main>
  </div>
</template>

<script>
import { selectedIcon } from './props';
import IconPickerIconList from './IconPickerIconList.vue';

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
    searchPlaceholder: {
      type: String,
      default: 'Search (en)',
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

<style lang="scss" scoped>
.modal-card-body {
  padding: 0;
}
</style>
