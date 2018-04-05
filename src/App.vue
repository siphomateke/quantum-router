<template>
  <div id="app">
    <dialogs :bus="globalBus"></dialogs>
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
                   {{ 'mode_'+modeNames[mode] | $i18n }}
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
import DialogManager from '@/components/dialogs/DialogManager.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Toolbar from '@/components/toolbar/Toolbar.vue';
import ToolbarItem from '@/components/toolbar/ToolbarItem.vue';
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import DropdownSelect from '@/components/dropdown/DropdownSelect.vue';
import router from 'huawei-router-api/browser';
const {RouterError} = router.errors;
import * as routerHelper from '@/browser/routerHelper';
import {modes, modeNames} from '@/store';
import {mapState, mapGetters, mapActions} from 'vuex';
import types from '@/store/mutation_types.js';
import NotificationsPopup from '@/components/notifications/NotificationsPopup.vue';
import {Notification} from '@/browser/notification.js';
import moment from 'moment';

Vue.mixin({
  methods: {
    $error(e) {
      let unknown = false;
      if (e instanceof RouterError) {
        const adminError = ['api_wrong_session', 'api_wrong_session_token', 'api_voice_busy', 'api_system_no_rights'];
        if (adminError.includes(e.code)) {
          this.changeMode(modes.BASIC);
        } else if (router.errors.isErrorInCategory(e.code, 'connection')) {
          this.changeMode(modes.OFFLINE);
        } else if (e.code === 'invalid_router_url') {
          if (router.config.getUrl().length > 0) {
            this.warningDialog({
              message: this.$i18n('invalid_router_url_error', router.config.getUrl()),
              confirmText: this.$i18n('dialog_open_settings'),
              onConfirm: () => {routerHelper.openOptionsPage()},
              category: 'admin',
            });
          } else {
            this.warningDialog({
              message: this.$i18n('empty_router_url_error'),
              confirmText: this.$i18n('dialog_open_settings'),
              onConfirm: () => {routerHelper.openOptionsPage()},
              category: 'admin',
            });
          }
        } else {
          unknown = true;
        }
      } else {
        unknown = true;
      }
      if (unknown) {
        let message;
        if (e instanceof RouterError) {
          message = e.code+' : '+e.message;
        } else {
          message = e.message
        }
        this.$toast.open({
          type: 'is-danger',
          message: 'Error: ' + message
        });
      }
      // TODO: log errors
    },
    $dialogClose(category) {
      this.globalBus.$emit('close-dialogs', category);
    },
    $dialogAlert(data) {
      this.globalBus.$emit('open-alert-dialog', data);
    },
    $dialogConfirm(data) {
      this.globalBus.$emit('open-confirm-dialog', data);
    },
    $dialogPrompt(data) {
      this.globalBus.$emit('open-prompt-dialog', data);
    },
  },
});

export default {
  name: 'app',
  components: {
    'dialogs': DialogManager,
    'drawer': Drawer,
    'drawer-item': DrawerItem,
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
        'second': 1000,
        'basic': 1000
      },
      currentTime: null,
      lastUpdatedNotifications: null,
      gettingSmsList: false,
    };
  },
  computed: {
    ...mapState({
      allNotifications: state => state.notifications.all,
      smsCount: state => state.sms.count,
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
    this.startRefreshCycle();

    this.globalBus.$on('refresh:second', () => {
      this.currentTime = Date.now();
    });

    this.globalBus.$on('refresh:basic', () => {
      this.globalBus.$emit('refresh:graph');
      this.globalBus.$emit('refresh:notifications');
    });

    this.tryChangeMode(modes.ADMIN);

    this.globalBus.$on('refresh:notifications', async () => {
      if (this.$adminMode) {
        if (!this.gettingSmsList) {
          this.gettingSmsList = true;
          try {
            await this.getSmsCount();
            const list = await router.sms.getFullSmsList({
              total: this.smsCount.LocalInbox,
            }, {
              sortOrder: 'desc',
            });
            let newNotifications = [];
            for (const message of list) {
              let exists = false;
              let n = Notification.fromSms(message);

              // Check if this notification is new
              for (const n2 of this.allNotifications) {
                if (n.id === n2.id) {
                  exists = true;
                  break;
                }
              }

              if (!exists) {
                newNotifications.push(n);
              }
            }
            this.addNotifications(newNotifications);

            this.lastUpdatedNotifications = Date.now();
          } catch (e) {
            this.$error(e);
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
        this.loadNotifications();
      }
    }
  },
  methods: {
    ...mapActions({
      setMode: 'setMode',
      addNotifications: 'notifications/add',
      loadNotifications: 'notifications/load',
      getSmsCount: 'sms/getCount',
    }),
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
    },
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
                } else {
                  this.$error(e);
                }
                this.warningDialog({
                  message: errorMessage,
                  confirmText: this.$i18n('dialog_retry'),
                  onConfirm: () => {this.tryChangeMode(newMode)},
                  category: 'admin',
                });
                return false;
              }
            }
          } catch (e) {
            // Handle ping errors
            if (e instanceof RouterError && router.errors.isErrorInCategory(e.code, 'connection')) {
              this.warningDialog({
                message: this.$i18n('connection_error', router.config.getUrl()),
                confirmText: this.$i18n('dialog_retry'),
                onConfirm: () => {this.tryChangeMode(newMode)},
                category: 'admin',
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
        this.$error(e);
        return false;
      }
    },
    async tryChangeMode(newMode) {
      if (newMode === modes.ADMIN) {
        this.$dialogClose('admin');
      }
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
        this.setMode(mode);
        this.$toast.open(this.$i18n('changed_mode_to', this.$i18n('mode_'+this.modeNames[mode])));
      }
    },
    warningDialog(data) {
      data.type = 'warning';
      this.$dialogConfirm(data);
    },
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

// TODO: Give this a better name and put it in a better place
.help-cursor {
  cursor: help;
}
</style>
