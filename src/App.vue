<template>
  <div id="app">
    <b-loading :active.sync="loading" :canCancel="false"></b-loading>
    <div class="app-wrapper columns is-gapless">
      <drawer title="Quantum Router" class="column is-2">
        <drawer-item
        link="home"
        icon="home"
        :label="this.$i18n('menu_home')"></drawer-item>
        <drawer-item
        link="sms"
        icon="comment"
        :label="this.$i18n('menu_sms')"></drawer-item>
        <drawer-item
        link="statistics"
        icon="pie-chart"
        :label="this.$i18n('menu_statistics')"></drawer-item>
        <drawer-item
        link="services"
        icon="terminal"
        :label="this.$i18n('menu_services')"></drawer-item>
        <drawer-item
        link="settings"
        icon="cog"
        :label="this.$i18n('menu_settings')"></drawer-item>
      </drawer>
      <div class="column">
        <q-toolbar>
          <template slot="toolbar-start">
            <q-toolbar-item :title="$i18n('change_mode_tooltip')" icon="bolt" :color="modeColor" ref="modeToolbarItem">
              <template slot="dropdown">
                <q-dropdown-select :value="$mode" @input="userChangedMode">
                  <q-dropdown-item :value="modes.OFFLINE">{{ 'mode_offline' | $i18n }}</q-dropdown-item>
                  <q-dropdown-item :value="modes.BASIC">{{ 'mode_basic' | $i18n }}</q-dropdown-item>
                  <q-dropdown-item :value="modes.ADMIN">{{ 'mode_admin' | $i18n }}</q-dropdown-item>
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
import Vue from 'vue';
import Drawer from '@/components/Drawer.vue';
import DrawerItem from '@/components/DrawerItem.vue';
import Navbar from '@/components/Navbar.vue';
import Toolbar from '@/components/Toolbar.vue';
import ToolbarItem from '@/components/ToolbarItem.vue';
import DropdownItem from '@/components/DropdownItem.vue';
import DropdownSelect from '@/components/DropdownSelect.vue';
import router from 'huawei-router-api/browser';
const {RouterError} = router.errors;
import * as routerHelper from '@/browser/routerHelper';
import {modes} from '@/store';
import {mapGetters} from 'vuex';
import * as types from '@/store/mutation_types.js';
import NotificationsPopup from '@/components/notifications/NotificationsPopup.vue';
import {Notification} from '@/browser/notification.js';
import moment from 'moment';

Vue.mixin({
  methods: {
    handleError(err) {
      return new Promise((resolve, reject) => {
        let message;
        if (err instanceof RouterError) {
          message = err.code+' : '+err.message;
        } else {
          message = err.message
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
    'drawer': Drawer,
    'drawer-item': DrawerItem,
    'b-navbar': Navbar,
    'q-toolbar': Toolbar,
    'q-toolbar-item': ToolbarItem,
    'q-dropdown-item': DropdownItem,
    'q-dropdown-select': DropdownSelect,
    'q-notifications-popup': NotificationsPopup
  },
  data() {
    return {
      loading: false,
      refreshIntervals: {
        'basic': 1000
      },
      lastUpdatedNotifications: null,
      gettingSmsList: false,
    };
  },
  computed: {
    ...mapGetters([
      'unreadNotifications',
      'smsCount',
    ]),
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
    this.tryChangeMode(modes.ADMIN);

    this.startRefreshCycle();

    this.globalBus.$on('refresh:basic', () => {
      this.globalBus.$emit('refresh:graph');
      this.globalBus.$emit('refresh:notifications');
    });

    this.globalBus.$on('refresh:notifications', async () => {
      if (this.$mode > modes.OFFLINE) {
        if (!this.gettingSmsList) {
          this.gettingSmsList = true;
          try {
            await this.$store.dispatch('getSmsCount');
            const list = await router.sms.getFullSmsList({
              total: this.smsCount.LocalInbox,
              filter: {
                // FIXME: This doesn't work since the time the messages is received
                // does not match up with the time in the message
                minDate: this.lastUpdatedNotifications,
              },
            }, {
              sortOrder: 'desc',
            });
            let newNotifications = [];
            for (const message of list) {
              let exists = false;
              let n = Notification.fromSms(message);

              // Check if this notification is new
              for (const n2 of this.allNotifications) {
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
          } catch (e) {
            this.handleError(e);
          } finally {
            this.gettingSmsList = false;
          }
        }
      }
    });
    routerHelper.events.addListener('optionsSaved', () => {
      this.tryChangeMode(modes.ADMIN);
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
        this.$store.dispatch('loadNotifications');
      }
    }
  },
  methods: {
    async updateConfig() {
      const data = await routerHelper.getLoginDetails();
      router.config.setUsername(data.username);
      router.config.setPassword(data.password);
      const url = await routerHelper.getRouterUrl();
      router.config.setUrl(url);
    },
    userChangedMode(newMode) {
      this.tryChangeMode(newMode);
    },
    async prepChangeMode(newMode) {
      try {
        await this.updateConfig();
        if (newMode === modes.BASIC || newMode === modes.ADMIN) {
          try {
            await router.utils.ping();
            if (newMode === modes.BASIC) {
              return true;
            } else if (newMode === modes.ADMIN) {
              try {
                await router.admin.login();
                return true;
              } catch(e) {
                let errorMessage = this.$i18n('router_unknown_error_logging_in');
                if (e instanceof RouterError) {
                  if (e.code === 'api_login_already_login') {
                    return true;
                  }
                  let knownErrors = [
                    'api_login_username_wrong',
                    'api_login_password_wrong',
                    'api_login_username_pwd_wrong',
                    'api_login_username_pwd_orerrun',
                  ];
                  if (knownErrors.includes(e.code)) {
                    let actualError = this.$i18n('router_module_error_'+e.code);
                    errorMessage = this.$i18n('router_error_logging_in', actualError);
                  }
                }
                this.openConfirmDialog({
                  message: errorMessage,
                  confirmText: this.$i18n('dialog_retry'),
                  onConfirm: () => {this.tryChangeMode(newMode)},
                });
                return false;
              }
            }
          } catch (e) {
            // Handle ping errors
            if (e instanceof RouterError && router.errors.isErrorInCategory(e.code, 'connection')) {
              this.openConfirmDialog({
                message: this.$i18n('connection_error', router.config.getUrl()),
                confirmText: this.$i18n('dialog_retry'),
                onConfirm: () => {this.tryChangeMode(newMode)},
              });
              return false;
            } else {
              throw e;
            }
          }
        } else {
          return true;
        }
      } catch (e) {
        if (e instanceof RouterError && e.code === 'invalid_router_url') {
          if (router.config.getUrl().length > 0) {
            this.openConfirmDialog({
              message: this.$i18n('invalid_router_url_error', router.config.getUrl()),
              confirmText: this.$i18n('dialog_open_settings'),
              onConfirm: () => {routerHelper.openOptionsPage()},
            });
            return false;
          } else {
            this.openConfirmDialog({
              message: this.$i18n('empty_router_url_error'),
              confirmText: this.$i18n('dialog_open_settings'),
              onConfirm: () => {routerHelper.openOptionsPage()},
            });
            return false;
          }
        } else {
          // TODO: Log unknown error. E.g http_request_error when trying to get loggedInState
        }
      }
    },
    async tryChangeMode(newMode) {
      this.loading = true;
      try {
        const ready = await this.prepChangeMode(newMode);
        if (ready) this.changeMode(newMode);
      } catch (e) {
        throw e;
      } finally {
        this.loading = false;
      }
    },
    changeMode(mode) {
      if (mode !== this.$mode) {
        this.$store.commit(types.MODE, mode);
        this.$toast.open('Changed mode to: '+this.$store.getters.modeName);
      }
    },
    openConfirmDialog(data) {
      data.type = 'is-warning';
      data.hasIcon = true;
      this.$dialog.confirm(data);
    },
    startRefreshCycle() {
      for (const name in this.refreshIntervals) {
        if (this.refreshIntervals.hasOwnProperty(name)) {
          const interval = this.refreshIntervals[name];
          const func = () => {
            this.globalBus.$emit('refresh:'+name);
            setTimeout(func, interval);
          };
          func();
        }
      }
    }
  },
};
</script>

<style lang="scss">
@import "~styles/global-base";

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
