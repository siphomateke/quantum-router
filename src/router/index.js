import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import SMS from '@/views/SMS';
import Settings from '@/views/Settings';
import wlan from '@/views/settings/wlan';
import dialup from '@/views/settings/dialup';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
        path: '/sms',
        name: 'sms',
        component: SMS
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
        children: [
            {
                path: 'wlan',
                name: 'settings/wlan',
                component: wlan,
                label: 'WLAN'
            },
            {
                path: 'dialup',
                name: 'settings/dialup',
                component: dialup,
                label: 'Dial-up'
            }
        ]
    }
  ]
});
