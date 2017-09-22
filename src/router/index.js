import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Sms from '@/views/Sms';
import Settings from '@/views/Settings';
import Wlan from '@/views/settings/Wlan';
import DialUp from '@/views/settings/DialUp';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: {name: 'home'},
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/sms',
      name: 'sms',
      component: Sms,
    },
    {
      path: '/statistics',
      name: 'statistics',
    },
    {
      path: '/ussd',
      name: 'ussd',
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      redirect: {name: 'settings/wlan'},
      children: [
        {
          path: 'wlan',
          name: 'settings/wlan',
          component: Wlan,
          label: 'WLAN',
        },
        {
          path: 'dialup',
          name: 'settings/dialup',
          component: DialUp,
          label: 'Dial-up',
        },
      ],
    },
    {
      path: '/extension-settings',
      name: 'extension-settings',
    },
  ],
});
