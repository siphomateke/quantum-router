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
      <div
        v-if="iconPacks.length > 1"
        class="tabs">
        <ul>
          <li
            v-for="(iconPack, index) in iconPacks"
            :key="iconPack.id"
            :label="iconPack.name"
            :class="{'is-active': index === activeTab}">
            <a @click="activeTab = index">
              <span>{{ iconPack.name }}</span
            ></a>
          </li>
        </ul>
      </div>
      <IconPickerIconList
        :search="search"
        :icon-pack="iconPacks[activeTab]"
        :value="value"
        @input="input"/>
    </main>
  </div>
</template>

<script>
import { selectedIcon } from './props';
import IconPickerIconList from './IconPickerIconList.vue';

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
    if (this.value.pack) {
      this.activeTab = this.iconPacks.findIndex(pack => pack.id === this.value.pack);
    }
    this.$refs.search.focus();
  },
  methods: {
    searchChange(value) {
      this.search = value;
    },
    input({ id, pack, name }) {
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
