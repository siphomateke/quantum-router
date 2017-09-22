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
import {RouterController} from '@/chrome/router.js';

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
          confirmText: 'Retry',
          cancelText: 'Ignore',
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
      error: {
        visible: false,
        message: '',
      },
    };
  },
  mounted() {
    chrome.runtime.sendMessage({
      from: 'app',
      type: 'loadEvent',
      loadState: 'load',
    });
    this.bus.$on('refresh', () => {
      let promises = [];
      promises.push(RouterController.getSmsCount().then((data) => {
        this.smsCount = data.LocalUnread;
      }).catch((e) => {
        if (!this.error.visible) {
          this.error.visible = true;
          this.handleError(e).then(() => {
            this.loading = true;
            this.error.visible = false;
          });
        }
      }));
      Promise.all(promises).then(() => {
        this.loading = false;
      });
    });
    this.refresh(0);
  },
  methods: {
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
