<template>
  <div id="app">
    <b-loading
      :active.sync="loading"
      :can-cancel="false"/>
    <TheTopbar @toggleSidebar="toggleSidebar"/>
    <div class="app-wrapper">
      <TheSidebar :collapsed.sync="sidebarCollapsed"/>
      <div class="page-wrapper">
        <keep-alive>
          <router-view/>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { modes } from '@/store';
import TheTopbar from '@/components/TheTopbar.vue';
import TheSidebar from '@/components/sidebar/TheSidebar.vue';

// TODO: Finish moving to Vuex
export default {
  name: 'App',
  components: {
    TheSidebar,
    TheTopbar,
  },
  data() {
    return {
      refreshIntervals: {
        graph: 1000,
        basic: 3000,
      },
      sidebarCollapsed: false,
    };
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      internalSettings: state => state.settings.internal,
    }),
  },
  watch: {
    $mode(val, oldVal) {
      switch (val) {
        case modes.ADMIN:
          this.globalBus.$emit('mode-change:admin');
          break;
        case modes.BASIC:
          this.globalBus.$emit('mode-change:basic');
          break;
        case modes.OFFLINE:
          this.globalBus.$emit('mode-change:offline');
          break;
        default:
          // do nothing
      }
      if (oldVal === modes.OFFLINE && val > modes.OFFLINE) {
        this.loadNotifications();
      }
    },
  },
  async mounted() {
    await this.$store.dispatch('settings/load');

    this.startRefreshCycle();

    this.globalBus.$on('refresh:basic', () => {
      if (!this.$store.state.loggingIn && this.$mode > modes.OFFLINE) {
        this.globalBus.$emit('refresh:notifications');
        this.globalBus.$emit('refresh:status');
      }
    });

    this.tryChangeMode(this.internalSettings.general.defaultMode);


    this.globalBus.$on('refresh:status', async () => {
      if (!this.$store.state.loggingIn && this.$mode > modes.OFFLINE) {
        this.$store.dispatch('settings/refreshStatus');
      }
    });

    this.globalBus.$on('refresh:notifications', async () => {
      if (!this.$store.state.loggingIn && this.$adminMode) {
        this.$store.dispatch('notifications/refresh');
      }
    });
    this.globalBus.$on('options-saved', () => {
      // TODO: Make sure this works
      this.tryChangeMode(this.internalSettings.general.defaultMode);
    });
  },
  methods: {
    ...mapActions({
      tryChangeMode: 'tryChangeMode',
      loadNotifications: 'notifications/load',
    }),
    startRefreshCycle() {
      for (const name of Object.keys(this.refreshIntervals)) {
        const interval = this.refreshIntervals[name];
        const func = () => {
          this.globalBus.$emit(`refresh:${name}`);
          setTimeout(func, interval);
        };
        func();
      }
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
  },
};
</script>

<style lang="scss">
@import "~styles/global-base";
</style>
