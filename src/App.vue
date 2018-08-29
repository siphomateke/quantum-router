<template>
  <div id="app">
    <b-loading :active.sync="loading" :canCancel="false"></b-loading>
    <div class="app-wrapper columns is-gapless">
      <drawer title="Quantum Router" class="column is-2">
        <drawer-item
          link="home"
          icon="home"
          :label="this.$i18n('menu_home')">
        </drawer-item>
        <drawer-item
          link="sms"
          icon="comment"
          :label="this.$i18n('menu_sms')">
        </drawer-item>
        <drawer-item
          link="statistics"
          icon="pie-chart"
          :label="this.$i18n('menu_statistics')">
        </drawer-item>
        <drawer-item
          link="services"
          icon="terminal"
          :label="this.$i18n('menu_services')">
        </drawer-item>
        <drawer-item
          link="settings"
          icon="cog"
          :label="this.$i18n('menu_settings')">
        </drawer-item>
        <drawer-item
          link="extension-settings"
          icon="sliders"
          :label="this.$i18n('menu_extension_settings')">
        </drawer-item>
      </drawer>
      <div class="column">
        <q-toolbar>
          <template slot="toolbar-start">
            <q-toolbar-item :title="$i18n('change_mode_tooltip')" icon="bolt" :color="modeColor" ref="modeToolbarItem">
              <template slot="dropdown">
                <q-dropdown-select :value="$mode" @input="userChangedMode">
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
            <q-toolbar-item :title="$i18n('notifications_tooltip')" icon="bell" :badge="unreadNotifications.length" :badge-visible="unreadNotifications.length > 0"
              position="is-bottom-left" class="notification-dropdown" :mobile-modal="false">
              <template slot="dropdown">
                <b-dropdown-item custom paddingless>
                  <q-notifications-popup :list="unreadNotifications" :loading="loadingNotifications"></q-notifications-popup>
                </b-dropdown-item>
              </template>
            </q-toolbar-item>
            <q-toolbar-item :title="$i18n('mobile_data_tooltip')" icon="plug" :is-active="mobileDataState"></q-toolbar-item>
            <q-toolbar-item icon="wifi"></q-toolbar-item>
          </template>
        </q-toolbar>
        <div class="page-wrapper">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Toolbar from '@/components/toolbar/Toolbar.vue';
import ToolbarItem from '@/components/toolbar/ToolbarItem.vue';
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import DropdownSelect from '@/components/dropdown/DropdownSelect.vue';
import * as routerHelper from '@/browser/routerHelper';
import {modes, modeNames} from '@/store';
import {mapState, mapGetters, mapActions} from 'vuex';
import NotificationsPopup from '@/components/notifications/NotificationsPopup.vue';

// TODO: Finish moving to Vuex
export default {
  name: 'app',
  components: {
    'drawer': Drawer,
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
      return this.allNotifications.length===0 && this.gettingSmsList;
    },
    // needed to send imported modes to html
    modes: () => modes,
    modeNames: () => modeNames,
    modeColor() {
      switch (this.$mode) {
      case modes.OFFLINE: {
        return '#f00';
      }
      case modes.BASIC: {
        return '#ffa500';
      }
      case modes.ADMIN: {
        return '#0f0';
      }
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
    routerHelper.events.addListener('optionsSaved', async () => {
      await this.$store.dispatch('settings/load');
      this.tryChangeMode(this.internalSettings.general.defaultMode);
    });
  },
  watch: {
    ['$mode'](val, oldVal) {
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
      }
      if (oldVal === modes.OFFLINE && val > modes.OFFLINE) {
        this.loadNotifications();
      }
    },
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
          this.globalBus.$emit('refresh:'+name);
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
