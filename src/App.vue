<template>
  <div id="app">
    <b-loading :active.sync="loading" :canCancel="false"></b-loading>
    <div class="app-wrapper columns is-gapless">
      <app-drawer :title="drawer.title" :items="drawer.items" class="column is-2"></app-drawer>
      <div class="column">
        <q-toolbar>
          <template slot="toolbar-end">
            <q-toolbar-item icon="bell" link="sms" :badge="smsCount" :badge-visible="smsCount > 0"></q-toolbar-item>
            <q-toolbar-item icon="plug"></q-toolbar-item>
            <q-toolbar-item icon="wifi"></q-toolbar-item>
          </template>
        </q-toolbar>
        <div class="page-wrapper">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global chrome */
import Vue from 'vue';
import Drawer from '@/components/Drawer.vue';
import Navbar from '@/components/Navbar.vue';
import Toolbar from '@/components/Toolbar.vue';
import ToolbarItem from '@/components/ToolbarItem.vue';
import {RouterController, RouterControllerError} from '@/chrome/router.js';
import {modes} from '@/store';

Vue.mixin({
  methods: {
    handleError(err) {
      return new Promise((resolve, reject) => {
        let message = err.code+' : '+err.error.message;
        if (err.code === 'tabs_not_found') {
          message = chrome.i18n.getMessage('router_error_'+err.code);
        }
        this.$dialog.confirm({
          title: 'Error',
          type: 'is-danger',
          hasIcon: true,
          message: message,
          confirmText: 'OK',
          cancelText: 'Cancel',
          onConfirm: () => {
            resolve();
          },
          onCancel: () => {
            reject();
          },
        });
      });
    },
  },
});

export default {
  name: 'app',
  components: {
    'app-drawer': Drawer,
    'b-navbar': Navbar,
    'q-toolbar': Toolbar,
    'q-toolbar-item': ToolbarItem,
  },
  data() {
    return {
      loading: true,
      refreshInterval: 1000,
      smsCount: 0,
      drawer: {
        title: 'Quantum Router',
        items: [{
          link: 'home',
          label: chrome.i18n.getMessage('menu_home'),
          icon: 'home',
        },
        {
          link: 'sms',
          label: chrome.i18n.getMessage('menu_sms'),
          icon: 'comment',
        },
        {
          link: 'statistics',
          label: chrome.i18n.getMessage('menu_statistics'),
          icon: 'pie-chart',
        },
        {
          link: 'ussd',
          label: chrome.i18n.getMessage('menu_services'),
          icon: 'terminal',
        },
        {
          link: 'settings',
          label: chrome.i18n.getMessage('menu_settings'),
          icon: 'cog',
        },
        ],
      },
    };
  },
  mounted() {
    chrome.runtime.sendMessage({
      from: 'app',
      type: 'loadEvent',
      loadState: 'load',
    });
    this.checkMode();
    this.bus.$on('refresh', () => {
      if (this.$store.state.mode > modes.OFFLINE) {
        RouterController.getSmsCount().then((data) => {
          this.smsCount = data.LocalUnread;
        }).catch((e) => {
          this.handleError(e);
        });
      }
    });
    this.refresh();
  },
  methods: {
    changeMode(mode) {
      this.$store.commit('mode', mode);
      this.$toast.open('Changed mode to: '+this.$store.state.mode);
    },
    checkMode() {
      this.loading = true;
      RouterController.ping().then(() => {
        RouterController.getTab().then(() => {
          this.changeMode(modes.ADMIN);
        }).catch((e) => {
          if (e instanceof RouterControllerError) {
            if (e.code === 'tabs_not_found') {
              this.$dialog.confirm({
                type: 'is-warning',
                hasIcon: true,
                message: chrome.i18n.getMessage('router_error_no_admin'),
                confirmText: chrome.i18n.getMessage('dialog_retry'),
                cancelText: chrome.i18n.getMessage('dialog_switch_to_basic'),
                onConfirm: () => this.checkMode(),
                onCancel: () => this.changeMode(modes.BASIC),
              });
            }
          }
        });
      }).catch((e) => {
        return RouterController.getRouterUrl().then((url) => {
          // TODO: Add option to redirect user to settings
          this.$dialog.confirm({
            type: 'is-warning',
            hasIcon: true,
            message: chrome.i18n.getMessage('connection_error', url),
            confirmText: chrome.i18n.getMessage('dialog_retry'),
            cancelText: chrome.i18n.getMessage('dialog_go_offline'),
            onConfirm: () => this.checkMode(),
            onCancel: () => this.changeMode(modes.OFFLINE),
          });
        }).catch((e2) => {
          this.$dialog.confirm({
            type: 'is-warning',
            hasIcon: true,
            message: chrome.i18n.getMessage('missing_router_url_error'),
            confirmText: chrome.i18n.getMessage('dialog_open_settings'),
            cancelText: chrome.i18n.getMessage('dialog_go_offline'),
            // Go to settings page so user can set router url
            onConfirm: () => this.$router.push('extension-settings'),
            onCancel: () => this.changeMode(modes.OFFLINE),
          });
        });
      }).then(() => {
        this.loading = false;
      });
    },
    refresh() {
      this.bus.$emit('refresh');
      setTimeout(this.refresh, this.refreshInterval);
    },
  },
};
</script>

<style lang="scss">
@import "~styles/vars";

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";
@import "~styles/bulma-extensions";

body {
  background: $page-background-color;
}

.page-wrapper {
  position: relative;
}

.page-content {
  /*display: block;
  background-color: $page-background-color;
  padding: 2em 1em;*/
}

.nav.menu {
  background-color: #fff;
  border-bottom: 1px solid #e1e1e1;
  z-index: 1;
}
</style>
