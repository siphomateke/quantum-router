<template>
  <div class="topbar-wrapper">
    <div class="topbar">
      <div class="topbar-left">
        <button
          :title="$i18n('topbar.tooltips.toggleSidebar')"
          class="button is-transparent is-inverted"
          @click="$emit('toggleSidebar')">
          <b-icon icon="bars"/>
        </button>
      </div>
      <div class="topbar-right">
        <b-dropdown
          :mobile-modal="false"
          position="is-bottom-left">
          <TopbarItem
            slot="trigger"
            :badge="unreadNotifications.length"
            :badge-visible="unreadNotifications.length > 0"
            :title="$i18n('topbar.tooltips.notifications')"
            icon="bell"
            class="notification-dropdown"/>
          <b-dropdown-item
            custom
            paddingless>
            <notifications-popup
              :list="unreadNotifications"
              :loading="loadingNotifications"/>
          </b-dropdown-item>
        </b-dropdown>
        <TopbarItem
          :title="$i18n('topbar.tooltips.mobileData')"
          :is-active="mobileDataState"
          icon="plug"/>
        <TopbarItem icon="wifi"/>
        <b-dropdown
          :mobile-modal="false"
          position="is-bottom-left">
          <TopbarItem
            slot="trigger"
            :title="$i18n('topbar.tooltips.changeMode')"
            :color="modeColor"
            icon="bolt"/>
          <dropdown-select
            :value="$mode"
            @input="userChangedMode">
            <dropdown-item
              v-for="mode in modes"
              :key="mode"
              :value="mode">
              {{ $i18n('modes.'+modeNames[mode]) }}
            </dropdown-item>
          </dropdown-select>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { modes, modeNames } from '@/store';
import TopbarItem from './TopbarItem.vue';
import NotificationsPopup from '@/components/notifications/NotificationsPopup.vue';
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import DropdownSelect from '@/components/dropdown/DropdownSelect.vue';

export default {
  name: 'TheTopbar',
  components: {
    TopbarItem,
    NotificationsPopup,
    DropdownItem,
    DropdownSelect,
  },
  computed: {
    ...mapState({
      allNotifications: state => state.notifications.all,
      gettingSmsList: state => state.gettingSmsList,
      mobileDataState: state => state.settings.dialup.mobileData,
    }),
    // needed to send imported modes to html
    modes: () => modes,
    modeNames: () => modeNames,
    modeColor() {
      switch (this.$mode) {
        case modes.OFFLINE:
          return '#f00';
        case modes.BASIC:
          return '#ffa500';
        case modes.ADMIN:
          return '#0f0';
        default:
          return null;
      }
    },
    loadingNotifications() {
      return this.allNotifications.length === 0 && this.gettingSmsList;
    },
    unreadNotifications() {
      return [...this.$store.getters['notifications/unread']].reverse();
    },
  },
  methods: {
    ...mapActions({
      tryChangeMode: 'tryChangeMode',
      addNotifications: 'notifications/add',
      getSmsCount: 'sms/getCount',
    }),
    userChangedMode(newMode) {
      this.tryChangeMode(newMode);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/vars.scss';

.topbar-wrapper {
  z-index: 10;
}

.topbar {
  display: flex;
  box-shadow: 0 0 10px rgba(0,0,0,0.6);
  padding: 0.5em;
  background: $topbar-background-color;

  .topbar-right {
    margin-left: auto;
  }
}
</style>

<style lang="scss">
.notification-dropdown .dropdown-content{
  box-shadow: 0 0 15px rgba(0,0,0,0.18);
  border: solid 1px rgba(10,10,10,0.2);
  padding: 0;
}
</style>
