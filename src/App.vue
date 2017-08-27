<template>
<div id="app">
  <div class="page-wrapper columns is-gapless">
    <app-drawer :title="drawer.title" :items="drawer.items" class="column is-2"></app-drawer>
    <div class="column">
      <q-toolbar :items="toolbar.items">
        <template slot="toolbar-end">
          <q-toolbar-item icon="bell" link="sms">
            <div class="badge">3</div>
          </q-toolbar-item>
        </template>
      </q-toolbar>
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue';
import Buefy from 'buefy';
import Drawer from '@/components/Drawer.vue';
import Navbar from '@/components/Navbar.vue';
import Toolbar from '@/components/Toolbar.vue';
import ToolbarItem from '@/components/ToolbarItem.vue';

Vue.use(Buefy, {
  defaultIconPack: 'fa'
});
export default {
  data() {
    return {
      drawer: {
        title: 'Quantum Router',
        items: [{
            link: 'home',
            label: 'Home',
            icon: 'home'
          },
          {
            link: 'sms',
            label: 'SMS',
            icon: 'comment'
          },
          {
            link: 'statistics',
            label: 'Statistics',
            icon: 'pie-chart'
          },
          {
            link: 'ussd',
            label: 'USSD',
            icon: 'terminal'
          },
          {
            link: 'settings',
            label: 'Settings',
            icon: 'cog'
          }
        ]
      },
      toolbar: {
        items:[
          {id: 0, icon:'bell'},
          {id: 1, icon: 'plug'},
          {id: 2, icon: 'wifi'},
        ]
      }
    }
  },
  methods: {
    
  },
  components: {
    'app-drawer': Drawer,
    'b-navbar': Navbar,
    'q-toolbar': Toolbar,
    'q-toolbar-item': ToolbarItem
  }
}
</script>

<style lang="scss">

@import "~styles/vars";

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";
@import "~styles/bulma-extensions";

body{
  background: $page-background-color;
}

.content {
  display: block;
  background-color: $page-background-color;
  padding: 2em 1em;
}

.nav.menu {
  background-color: #fff;
  border-bottom: 1px solid #e1e1e1;
  z-index: 1;
}
</style>
