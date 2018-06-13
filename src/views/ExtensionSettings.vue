<template>
  <div class="box">
    <form @submit.prevent="submit">
      <h4 class="title is-4">Extension Settings</h4>
      <b-tabs v-if="loadedSettings">
        <b-tab-item label="General">
          <config-field
            label="Default mode"
            description="The mode that is the default when you first open Quantum router">
            <template v-for="mode in modes">
              <b-radio
                :key="mode"
                v-model="settings.general.defaultMode"
                :native-value="mode">
                {{ $i18n('mode_'+modeNames[mode]) }}
              </b-radio>
            </template>
          </config-field>
          <config-field
            label="Remember password"
            description="Whether Quantum should save your login details">
            <b-checkbox v-model="settings.general.rememberLoginDetails">
            </b-checkbox>
          </config-field>
        </b-tab-item>
        <b-tab-item label="SMS">
          <config-field
            label="Hide SIM boxes">
            <b-checkbox v-model="settings.sms.hideSimBoxes">
            </b-checkbox>
          </config-field>
          <config-field
            label="Show confirmation dialogs"
            description="Actions which will show confirmation dialogs before execution">
            <b-checkbox
              v-model="settings.sms.confirmDialogsToShow"
              native-value="delete">
              Delete
            </b-checkbox>
            <b-checkbox
              v-model="settings.sms.confirmDialogsToShow"
              native-value="import">
              Import
            </b-checkbox>
          </config-field>
          <config-field
            label="Message icons"
            description="The icons to use for different message types">
            <b-field
              horizontal
              v-for="smsType in smsTypes"
              :key="smsType"
              :label="getSmsTypeName(smsType)">
              <icon-picker v-model="settings.sms.typeIcons[smsType]"></icon-picker>
            </b-field>
          </config-field>
        </b-tab-item>
      </b-tabs>
      <div class="buttons is-centered">
        <button
          class="button is-primary"
          type="submit"
          :class="{'is-loading': saving}">
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import {modes, modeNames} from '@/store';
import smsTypeMixin from '@/mixins/smsType';
import router from 'huawei-router-api/browser';
import IconPicker from '@/components/iconpicker';
import ConfigField from '@/components/settings/ConfigField';

const smsTypes = router.sms.types;

// TODO: Add a button to reset settings to their defaults
export default {
  mixins: [smsTypeMixin],
  components: {
    IconPicker,
    ConfigField,
  },
  data() {
    return {
      loadedSettings: false,
      saving: false,
      settings: {},
    };
  },
  computed: {
    modes: () => modes,
    modeNames: () => modeNames,
    smsTypes: () => smsTypes,
  },
  async beforeMount() {
    await this.$store.dispatch('settings/load');
    const stateSettings = this.$store.state.settings.internal;
    for (const domain of Object.keys(stateSettings)) {
      this.$set(this.settings, domain, {});
      for (const name of Object.keys(stateSettings[domain])) {
        this.$set(this.settings[domain], name, stateSettings[domain][name]);
      }
    }
    this.loadedSettings = true;
  },
  methods: {
    async setSetting(path, value) {
      await this.$store.dispatch('settings/set', {path: 'internal.'+path, value});
    },
    async submit() {
      this.saving = true;
      const promises = [];
      for (const domain of Object.keys(this.settings)) {
        for (const name of Object.keys(this.settings[domain])) {
          promises.push(this.setSetting(domain+'.'+name, this.settings[domain][name]));
        }
      }
      try {
        await Promise.all(promises);
        await this.$store.dispatch('settings/save');
        this.$toast.open({
          message: 'Saved settings',
          type: 'is-success',
        });
      } catch (e) {
        this.$toast.open({
          message: 'Failed to save settings',
          type: 'is-danger',
        });
        this.$store.dispatch('handleError', e);
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
