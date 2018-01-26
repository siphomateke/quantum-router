<template>
  <div id="app">
    <b-loading :active.sync="loading" :canCancel="false"></b-loading>
    <div class="app-wrapper columns is-gapless">
      <app-drawer :title="drawer.title" :items="drawer.items" class="column is-2"></app-drawer>
      <div class="column">
        <q-toolbar>
          <template slot="toolbar-start">
            <q-toolbar-item icon="bolt" :color="modeColor" ref="modeToolbarItem">
              <template slot="dropdown">
                <q-dropdown-select :value="mode" @input="userChangedMode">
                  <q-dropdown-item :value="modes.OFFLINE">{{ 'mode_offline' | $i18n }}</q-dropdown-item>
                  <q-dropdown-item :value="modes.BASIC">{{ 'mode_basic' | $i18n }}</q-dropdown-item>
                  <q-dropdown-item :value="modes.ADMIN">{{ 'mode_admin' | $i18n }}</q-dropdown-item>
                </q-dropdown-select>
              </template>
            </q-toolbar-item>
          </template>
          <template slot="toolbar-end">
            <q-toolbar-item icon="bell" :badge="unreadNotifications.length" :badge-visible="unreadNotifications.length > 0"
              position="is-bottom-left" class="notification-dropdown" :mobile-modal="false">
              <template slot="dropdown">
                <b-dropdown-item custom paddingless>
                  <q-notifications-popup :list="unreadNotifications" :loading="loadingNotifications"></q-notifications-popup>
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
import router, {RouterControllerError} from '@/router';
import {modes} from '@/store';
import {mapGetters} from 'vuex';
import * as types from '@/store/mutation_types.js';
import NotificationsPopup from '@/components/notifications/NotificationsPopup';
import {Notification} from '@/chrome/notification.js';
import moment from 'moment';

Vue.mixin({
  methods: {
    handleError(err) {
      return new Promise((resolve, reject) => {
        let message = err.code+' : '+err.message;
        if (err.code === 'tabs_not_found') {
          message = this.$i18n('router_error_'+err.code);
        }
        this.$toast.open({
          type: 'is-danger',
          message: 'Error: ' + message
        });
        reject();
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
      lastUpdatedNotifications: null,
      gettingSmsList: false,
      drawer: {
        title: 'Quantum Router',
        items: [{
          link: 'home',
          label: this.$i18n('menu_home'),
          icon: 'home',
        },
        {
          link: 'sms',
          label: this.$i18n('menu_sms'),
          icon: 'comment',
        },
        {
          link: 'statistics',
          label: this.$i18n('menu_statistics'),
          icon: 'pie-chart',
        },
        {
          link: 'services',
          label: this.$i18n('menu_services'),
          icon: 'terminal',
        },
        {
          link: 'settings',
          label: this.$i18n('menu_settings'),
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
    allNotifications() {
      return this.$store.state.notifications.all;
    },
    loadingNotifications() {
      return this.allNotifications.length===0 && this.gettingSmsList;
    },
    // needed to send imported modes to html
    modes() {
      return modes;
    },
    modeColor() {
      switch (this.mode) {
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
    mode() {
      return this.$store.state.mode;
    }
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
      if (this.mode > modes.OFFLINE) {
        if (!this.gettingSmsList) {
          this.gettingSmsList = true;
          router.sms.getSmsCount().then((data) => {
            return router.sms.getFullSmsList({
              total: data.LocalInbox,
              filter: {
                minDate: this.lastUpdatedNotifications,
              },
            }, {
              sortOrder: 'desc',
            }).then((list) => {
              let newNotifications = [];
              for (let message of list) {
                let exists = false;
                let n = Notification.fromSms(message);

                // Check if this notification is new
                for (let n2 of this.allNotifications) {
                  if (n.date > n2.Date) {
                    break;
                  } else if (n.date === n2.Date) {
                    if (n.id === n2.id) {
                      exists = true;
                      break;
                    }
                  }
                }

                if (!exists) {
                  newNotifications.push(n);
                }
              }
              this.$store.dispatch('addNotifications', newNotifications);

              this.lastUpdatedNotifications = Date.now();
            });
          }).catch((e) => {
            this.handleError(e);
          }).finally(() => {
            this.gettingSmsList = false;
          });
        }
      }
    });
    this.refresh();
  },
  watch: {
    mode(val, oldVal) {
      this.modeChanged(val, oldVal);
    }
  },
  methods: {
    modeChanged(val, oldVal) {
      if (oldVal === modes.OFFLINE && val > modes.OFFLINE) {
        this.$store.dispatch('loadNotifications');
      }
    },
    userChangedMode(newMode) {
      this.tryChangeMode(newMode);
    },
    tryChangeMode(newMode) {
      if (newMode === modes.BASIC || newMode === modes.ADMIN) {
        this.loading = true;
        router.utils.ping().then(() => {
          if (newMode === modes.BASIC) {
            this.changeMode(newMode);
          } else if (newMode === modes.ADMIN) {
            return router.admin.isLoggedIn().then((loggedIn) => {
              if (!loggedIn) {
                router.admin.login().then(() => {
                  this.changeMode(newMode);
                }).catch((e) => {
                  this.openConfirmDialog({
                    message: this.$i18n('router_error_logging_in'),
                    confirmText: this.$i18n('dialog_retry'),
                    onConfirm: () => this.tryChangeMode(newMode),
                  });
                });
              } else {
                this.changeMode(newMode);
              }
            });
          }
        }).catch((e) => {
          return router.utils.getRouterUrl().then((url) => {
            this.openConfirmDialog({
              message: this.$i18n('connection_error', url),
              confirmText: this.$i18n('dialog_retry'),
              onConfirm: () => this.tryChangeMode(newMode),
            });
          }).catch((e2) => {
            this.openConfirmDialog({
              message: this.$i18n('missing_router_url_error'),
              confirmText: this.$i18n('dialog_open_settings'),
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
      if (mode !== this.mode) {
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
      router.utils.ping().then(() => {
        return router.admin.isLoggedIn().then((loggedIn) => {
          if (!loggedIn) {
            router.admin.login().then(() => {
              this.changeMode(modes.ADMIN);
            }).catch((e) => {
              this.openConfirmDialog({
                message: this.$i18n('router_error_logging_in'),
                confirmText: this.$i18n('dialog_retry'),
                cancelText: this.$i18n('dialog_switch_to_basic'),
                onConfirm: () => this.checkMode(),
                onCancel: () => this.changeMode(modes.BASIC),
              });
            });
          } else {
            this.changeMode(modes.ADMIN);
          }
        });
      }).catch((e) => {
        return router.utils.getRouterUrl().then((url) => {
          // TODO: Add option to redirect user to settings
          this.openConfirmDialog({
            message: this.$i18n('connection_error', url),
            confirmText: this.$i18n('dialog_retry'),
            cancelText: this.$i18n('dialog_go_offline'),
            onConfirm: () => this.checkMode(),
            onCancel: () => this.changeMode(modes.OFFLINE),
          });
        }).catch((e2) => {
          this.openConfirmDialog({
            message: this.$i18n('missing_router_url_error'),
            confirmText: this.$i18n('dialog_open_settings'),
            cancelText: this.$i18n('dialog_go_offline'),
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

@import "~font-awesome/css/font-awesome.min.css";

body {
  background: $page-background-color;
}

.page-wrapper {
  position: relative;
}

.page-content {
  background-color: $content-background-color;
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
