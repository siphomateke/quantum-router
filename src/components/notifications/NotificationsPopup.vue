<template>
  <div class="notification-popup">
    <div class="popup-card">
      <header class="popup-card-head">
        <span class="popup-card-title">{{ 'notifications_title' | i18n}}</span>
      </header>
      <section class="popup-card-body">
        <q-notification-list :list="list"></q-notification-list>
      </section>
    </div>
  </div>
</template>

<script>
import NotificationList from '@/components/notifications/NotificationList';

export default {
  name: 'NotificationsPopup',
  components: {
    'q-notification-list': NotificationList,
  },
  props: {
    list: Array,
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';

  .notification-popup{
    .popup-card{
      .popup-card-head{
        border-bottom: 1px solid #dbdbdb;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        background-color: #f5f5f5;
        padding: 15px;
        .popup-card-title{
          color: #363636;
          font-weight: bold;
          line-height: 1;
        }
      }
    }
  }
</style>
