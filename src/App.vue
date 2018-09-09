<template>
  <div id="app">
    <b-loading
      :active.sync="loading"
      :can-cancel="false"/>
    <div class="app-wrapper columns is-gapless">
      <drawer
        title="Quantum Router"
        class="column is-2">
        <drawer-item
          :label="this.$i18n('menu_home')"
          link="home"
          icon="home"/>
        <drawer-item
          :label="this.$i18n('menu_sms')"
          link="sms"
          icon="comment"/>
        <drawer-item
          :label="this.$i18n('menu_statistics')"
          link="statistics"
          icon="pie-chart"/>
        <drawer-item
          :label="this.$i18n('menu_services')"
          link="services"
          icon="terminal"/>
        <drawer-item
          :label="this.$i18n('menu_settings')"
          link="settings"
          icon="cog"/>
        <drawer-item
          :label="this.$i18n('menu_app_settings')"
          link="app-settings"
          icon="sliders"/>
      </drawer>
      <div class="column">
        <q-toolbar>
          <template slot="toolbar-start">
            <q-toolbar-item
              ref="modeToolbarItem"
              :title="$i18n('change_mode_tooltip')"
              :color="modeColor"
              icon="bolt">
              <template slot="dropdown">
                <q-dropdown-select
                  :value="$mode"
                  @input="userChangedMode">
                  <q-dropdown-item
                    v-for="mode in modes"
                    :key="mode"
                    :value="mode">
                    {{ $i18n('mode_'+modeNames[mode]) }}
                  </q-dropdown-item>
                </q-dropdown-select>
              </template>
            </q-toolbar-item>
          </template>
          <template slot="toolbar-end">
            <q-toolbar-item
              :title="$i18n('notifications_tooltip')"
              :badge="unreadNotifications.length"
              :badge-visible="unreadNotifications.length > 0"
              :mobile-modal="false"
              icon="bell"
              position="is-bottom-left"
              class="notification-dropdown">
              <template slot="dropdown">
                <b-dropdown-item
                  custom
                  paddingless>
                  <q-notifications-popup
                    :list="unreadNotifications"
                    :loading="loadingNotifications"/>
                </b-dropdown-item>
              </template>
            </q-toolbar-item>
            <q-toolbar-item
              :title="$i18n('mobile_data_tooltip')"
              :is-active="mobileDataState"
              icon="plug"/>
            <q-toolbar-item icon="wifi"/>
          </template>
        </q-toolbar>
        <div class="page-wrapper">
          <keep-alive>
            <router-view/>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Toolbar from '@/components/toolbar/Toolbar.vue';
import ToolbarItem from '@/components/toolbar/ToolbarItem.vue';
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import DropdownSelect from '@/components/dropdown/DropdownSelect.vue';
import { modes, modeNames } from '@/store';
import { mapState, mapGetters, mapActions } from 'vuex';
import NotificationsPopup from '@/components/notifications/NotificationsPopup.vue';

// TODO: Finish moving to Vuex
export default {
  name: 'App',
  components: {
    drawer: Drawer,
    'drawer-item': DrawerItem,
    'q-toolbar': Toolbar,
    'q-toolbar-item': ToolbarItem,
    'q-dropdown-item': DropdownItem,
    'q-dropdown-select': DropdownSelect,
    'q-notifications-popup': NotificationsPopup,
  },
  data() {
    return {
      refreshIntervals: {
        graph: 1000,
        basic: 3000,
      },
    };
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      allNotifications: state => state.notifications.all,
      boxes: state => state.sms.boxes,
      gettingSmsList: state => state.gettingSmsList,
      mobileDataState: state => state.settings.dialup.mobileData,
      internalSettings: state => state.settings.internal,
    }),
    ...mapGetters({
      modeName: 'modeName',
      unreadNotifications: 'notifications/unread',
    }),
    loadingNotifications() {
      return this.allNotifications.length === 0 && this.gettingSmsList;
    },
    // needed to send imported modes to html
    modes: () => modes,
    modeNames: () => modeNames,
    modeColor() {
      switch (this.$mode) {
        case modes.OFFLINE:
          return '#f00';
        case modes.BASIC:
          return '#ffa500';
        case modes.ADMIN:
          return '#0f0';
        default:
          return null;
      }
    },
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
      setMode: 'setMode',
      tryChangeMode: 'tryChangeMode',
      addNotifications: 'notifications/add',
      loadNotifications: 'notifications/load',
      getSmsCount: 'sms/getCount',
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
    userChangedMode(newMode) {
      this.tryChangeMode(newMode);
    },
  },
};
</script>

<style lang="scss">
@import "~styles/global-base";
</style>
