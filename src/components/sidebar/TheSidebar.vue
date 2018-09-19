<template>
  <aside
    :class="{collapsed: internalCollapsed, floating}"
    class="sidebar">
    <sidebar-item
      v-for="view in views"
      :key="view.name"
      :label="$i18n(`menu.${view.name}`)"
      :link="view.name"
      :icon="view.icon"
      @click="itemClicked"/>
  </aside>
</template>

<script>
import windowSizeMixin from '@/mixins/windowSize.js';
import SidebarItem from './SidebarItem.vue';

// TODO: Make this customisable
const viewIcons = {
  home: 'home',
  sms: 'comment',
  statistics: 'pie-chart',
  services: 'terminal',
  settings: 'cog',
  appSettings: 'sliders',
};

export default {
  components: {
    SidebarItem,
  },
  mixins: [windowSizeMixin],
  props: {
    title: {
      type: String,
      default: '',
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      views: [],
      internalCollapsed: this.collapsed,
      floating: false,
    };
  },
  watch: {
    collapsed(value) {
      this.internalCollapsed = value;
    },
    internalCollapsed(value) {
      this.$emit('update:collapsed', value);
    },
    windowWidth(width) {
      if (width < 600) {
        this.floating = true;
      } else {
        this.floating = false;
      }
    },
  },
  mounted() {
    for (const route of this.$router.options.routes) {
      if (route.name) {
        this.views.push({
          name: route.name,
          icon: viewIcons[route.name],
        });
      }
    }
  },
  methods: {
    itemClicked() {
      if (this.floating) {
        this.internalCollapsed = true;
      }
    },
  },
};
</script>

<style lang="scss" src="./style.scss"/>
