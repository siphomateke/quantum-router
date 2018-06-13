<template>
<div class="section">
  <div class="columns">
    <div class="column">
      <b-panel>
        <h5 slot="header" class="title is-5">Connection</h5>
        <div class="content">
          <div class="field">
            <b-switch v-model="values.mobileData" :disabled="disabled.mobileData">Mobile data</b-switch>
          </div>
          <div class="field">
            <b-switch v-model="values.roaming" :disabled="disabled.roaming">Data roaming <b-tag type="is-warning">Not implemented</b-tag></b-switch>
          </div>
        </div>
      </b-panel>
    </div>

    <div class="column">
      <b-panel>
        <h5 slot="header" class="title is-5">Network <b-tag type="is-warning">Not implemented</b-tag></h5>
        <div class="content">
          <div class="field">
            <b-switch v-model="values.lte" :disabled="disabled.lte">Support LTE networks</b-switch>
          </div>
          <b-field label="Search mode">
            <b-select v-model="values.networkSearchMode" :disabled="disabled.networkSearchMode">
              <option v-for="option in networkSearchModes" :value="option.value" :key="option.value">
                {{ option.label }}
              </option>
            </b-select>
          </b-field>
        </div>
      </b-panel>
    </div>
  </div>

  <button class="button is-primary" @click="apply">Apply</button>

</div>
</template>

<script>
import {mapState} from 'vuex';

export default {
  name: 'SettingsDialUp',
  data() {
    return {
      values: {
        mobileData: false,
        roaming: false,
        lte: false,
        networkSearchMode: 0,
      },
      disabled: {
        mobileData: false,
        roaming: true,
        lte: true,
        networkSearchMode: true,
      },
      synced: false,
      networkSearchModes: [
        {value: 0, label: 'Auto'},
        {value: 1, label: 'Manual'},
      ],
    };
  },
  computed: {
    ...mapState({
      settings: state => state.settings.dialup,
    }),
  },
  watch: {
    synced(val) {
      if (val === false) {
        for (const key of Object.keys(this.disabled)) {
          this.disabled[key] = true;
        }
      }
    },
  },
  mounted() {
    this.synced = false;
    if (this.$adminMode) {
      this.updateSettings();
    }
    this.globalBus.$on('mode-change:admin', this.updateSettings);
  },
  beforeDestroy() {
    this.globalBus.$off('mode-change:admin', this.updateSettings);
  },
  methods: {
    async updateSettings() {
      // FIXME: Implement all settings
      await this.$store.dispatch('settings/getMobileDataSwitch');
      // await this.$store.dispatch('settings/getRoamingSwitch');

      this.values.mobileData = this.settings.mobileData;
      /* this.values.roaming = this.$store.getters['settings/roaming'];
      this.values.lte = this.settings.lte;
      this.values.networkSearchMode = this.settings.networkSearchMode; */

      this.synced = true;
    },
    async apply() {
      try {
        await this.$store.dispatch('settings/setMobileDataSwitch', this.values.mobileData);
        // await this.$store.dispatch('settings/setRoamingSwitch', this.values.roaming);
      } catch (e) {
        this.$store.dispatch('handleError', e);
      }
    },
  },
};
</script>
