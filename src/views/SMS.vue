<template>
<div class="box">
  <div class="field is-grouped">
    <div v-for="action in actions" class="control">
      <button class="button" :class="action.class">
        <b-icon :icon="action.icon"></b-icon>
        <span>{{action.label}}</span>
      </button>
    </div>
  </div>
  <sms-list :list="list" :checked-rows="checkedRows"></sms-list>
</div>
</template>

<script>
import {SmsList} from '@/components/sms';
export default {
  components: {
    'sms-list': SmsList
  },
  data() {
    let list  = [
      {read: false, number: 'MTNZM', date: '2017-08-28 08:23:26', content: 'You have Data 16.0 MB Home Data Valid until 2017-09-02 00:00:00. Get a bundle that allows you to CALL across ALL NETWORKS. Dial *211# and get it NOW.'},
      {read: true, number: 'MTNZM', date: '2017-08-28 08:23:26', content: 'You have Data 16.0 MB Home Data Valid until 2017-09-02 00:00:00. Get a bundle that allows you to CALL across ALL NETWORKS. Dial *211# and get it NOW.'},
      {read: true, number: '260977446080', date: '2017-08-28 08:23:26', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'},
      {read: false, number: 'MTNZM', date: '2017-08-28 08:23:26', content: 'You have Data 16.0 MB Home Data Valid until 2017-09-02 00:00:00. Get a bundle that allows you to CALL across ALL NETWORKS. Dial *211# and get it NOW.'}
    ]
    return {
      list: list,
      checkedRows: [],
      actions: [
        {label: 'New message', icon: 'plus', class: 'is-primary'},
        {label: 'Delete', icon: 'trash', class: 'is-danger'},
        {label: 'Import', icon: 'download'}
      ]
    };
  }
}
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
