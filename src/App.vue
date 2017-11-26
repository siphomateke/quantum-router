<template>
  <div id="app">
    <b-loading :active.sync="loading" :canCancel="false"></b-loading>
    <div class="app-wrapper columns is-gapless">
      <app-drawer :title="drawer.title" :items="drawer.items" class="column is-2"></app-drawer>
      <div class="column">
        <q-toolbar>
          <template slot="toolbar-start">
            <!-- FIXME: Dropdown does not update with selectedMode -->
            <q-toolbar-item icon="bolt" :color="modeColor" ref="modeToolbarItem">
              <template slot="dropdown">
                <q-dropdown-select :value="selectedMode" @input="selectedModeChanged">
                  <q-dropdown-item :value="modes.OFFLINE">Offline</q-dropdown-item>
                  <q-dropdown-item :value="modes.BASIC">Basic</q-dropdown-item>
                  <q-dropdown-item :value="modes.ADMIN">Admin</q-dropdown-item>
                </q-dropdown-select>
              </template>
            </q-toolbar-item>
          </template>
          <template slot="toolbar-end">
            <q-toolbar-item icon="bell" :badge="smsCount" :badge-visible="smsCount > 0"
              position="is-bottom-left" class="notification-dropdown" :mobile-modal="false">
              <template slot="dropdown">
                <b-dropdown-item custom paddingless>
                  <q-notifications-popup :list="unreadNotifications"></q-notifications-popup>
                </b-dropdown-item>
              </template>
            </q-toolbar-item>
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
import DropdownItem from '@/components/DropdownItem.vue';
import DropdownSelect from '@/components/DropdownSelect.vue';
import {RouterController, RouterControllerError} from '@/chrome/router.js';
import {modes} from '@/store';
import {mapGetters} from 'vuex';
import * as types from '@/store/mutation_types.js';
import NotificationsPopup from '@/components/notifications/NotificationsPopup';

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
    'q-dropdown-item': DropdownItem,
    'q-dropdown-select': DropdownSelect,
    'q-notifications-popup': NotificationsPopup
  },
  data() {
    return {
      loading: true,
      refreshInterval: 1000,
      smsCount: 0,
      selectedMode: this.$store.state.mode,
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
          link: 'services',
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
  computed: {
    ...mapGetters({
      unreadNotifications: 'unreadNotifications'
    }),
    // used in html
    modes() {
      return modes;
    },
    modeColor() {
      switch (this.$store.state.mode) {
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
  mounted() {
    chrome.runtime.sendMessage({
      from: 'app',
      type: 'loadEvent',
      loadState: 'load',
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.from === 'background' && request.type === 'routerContentLoadEvent') {
        if (request.event === 'load') {
          // TODO: update mode when router page is opened
          // this.$toast.open('Connected to router page');
          // this.checkMode();
        } else if (request.event === 'unload') {
          // this.checkMode();
        }
      }
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
    selectedModeChanged(newMode) {
      this.tryChangeMode(newMode);
    },
    tryChangeMode(newMode) {
      if (newMode === modes.BASIC || newMode === modes.ADMIN) {
        this.loading = true;
        RouterController.ping().then(() => {
          if (newMode === modes.BASIC) {
            this.changeMode(newMode);
          } else if (newMode === modes.ADMIN) {
            RouterController.getTab().then((tab) => {
              return RouterController.isLoggedIn().then((loggedIn) => {
                if (!loggedIn) {
                  RouterController.login().then(() => {
                    this.changeMode(newMode);
                  }).catch((e) => {
                    this.openConfirmDialog({
                      message: chrome.i18n.getMessage('router_error_logging_in'),
                      confirmText: chrome.i18n.getMessage('dialog_retry'),
                      onConfirm: () => this.tryChangeMode(newMode),
                    });
                  });
                } else {
                  this.changeMode(newMode);
                }
              });
            }).catch((e) => {
              if (e instanceof RouterControllerError) {
                if (e.code === 'tabs_not_found') {
                  this.openConfirmDialog({
                    message: chrome.i18n.getMessage('router_error_no_admin'),
                    confirmText: chrome.i18n.getMessage('dialog_retry'),
                    onConfirm: () => this.tryChangeMode(newMode),
                  });
                }
              }
            });
          }
        }).catch((e) => {
          return RouterController.getRouterUrl().then((url) => {
            this.openConfirmDialog({
              message: chrome.i18n.getMessage('connection_error', url),
              confirmText: chrome.i18n.getMessage('dialog_retry'),
              onConfirm: () => this.tryChangeMode(newMode),
            });
          }).catch((e2) => {
            this.openConfirmDialog({
              message: chrome.i18n.getMessage('missing_router_url_error'),
              confirmText: chrome.i18n.getMessage('dialog_open_settings'),
              // Go to settings page so user can set router url
              onConfirm: () => this.$router.push('extension-settings'),
            });
          });
        }).then(() => {
          // FIXME: loading stops before new tab loads
          this.loading = false;
        });
      } else {
        this.changeMode(newMode);
      }
    },
    changeMode(mode) {
      if (mode !== this.$store.state.mode) {
        this.selectedMode = mode;
        this.$store.commit(types.MODE, mode);
        this.$toast.open('Changed mode to: '+this.$store.getters.modeName);
      }
    },
    openConfirmDialog(data) {
      data.type = 'is-warning';
      data.hasIcon = true;
      this.$dialog.confirm(data);
    },
    checkMode() {
      this.loading = true;
      RouterController.ping().then(() => {
        RouterController.getTab().then((tab) => {
          return RouterController.isLoggedIn().then((loggedIn) => {
            if (!loggedIn) {
              RouterController.login().then(() => {
                this.changeMode(modes.ADMIN);
              }).catch((e) => {
                this.openConfirmDialog({
                  message: chrome.i18n.getMessage('router_error_logging_in'),
                  confirmText: chrome.i18n.getMessage('dialog_retry'),
                  cancelText: chrome.i18n.getMessage('dialog_switch_to_basic'),
                  onConfirm: () => this.checkMode(),
                  onCancel: () => this.changeMode(modes.BASIC),
                });
              });
            } else {
              this.changeMode(modes.ADMIN);
            }
          });
        }).catch((e) => {
          if (e instanceof RouterControllerError) {
            if (e.code === 'tabs_not_found') {
              this.openConfirmDialog({
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
          this.openConfirmDialog({
            message: chrome.i18n.getMessage('connection_error', url),
            confirmText: chrome.i18n.getMessage('dialog_retry'),
            cancelText: chrome.i18n.getMessage('dialog_go_offline'),
            onConfirm: () => this.checkMode(),
            onCancel: () => this.changeMode(modes.OFFLINE),
          });
        }).catch((e2) => {
          this.openConfirmDialog({
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

.notification-dropdown .dropdown-content{
  box-shadow: 0 0 15px rgba(0,0,0,0.18);
  border: solid 1px rgba(10,10,10,0.2);
  padding: 0;
}
</style>
