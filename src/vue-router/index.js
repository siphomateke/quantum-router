import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Sms from '@/views/SMS';
import Services from '@/views/Services';
import Settings from '@/views/Settings';
import Wlan from '@/views/settings/wlan';
import DialUp from '@/views/settings/dialup';
import AppSettings from '@/views/AppSettings';

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
      path: '/services',
      name: 'services',
      component: Services,
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
      path: '/app-settings',
      name: 'app-settings',
      component: AppSettings,
    },
  ],
});
