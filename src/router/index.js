import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import SMS from '@/views/SMS';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
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
    }
  ]
});
