<template>
  <div class="box">
    <form @submit.prevent="submit">
      <h4 class="title is-4">{{ $i18n('options_header') }}</h4>
      <b-tabs v-if="loadedSettings">
        <b-tab-item :label="$i18n('options_tabs_general')">
          <config-field
            :label="$i18n('options_general_defaultMode')"
            :description="$i18n('options_descriptions_general_defaultMode')">
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
            :label="$i18n('options_labels_general_rememberLogin')"
            :description="$i18n('options_descriptions_general_rememberLogin')">
            <b-checkbox v-model="settings.general.rememberLoginDetails">
            </b-checkbox>
          </config-field>
        </b-tab-item>
        <b-tab-item :label="$i18n('options_tabs_sms')">
          <config-field
            :label="$i18n('options_labels_general_hideSimBoxes')"
            :description="$i18n('options_descriptions_general_hideSimBoxes')">
            <b-checkbox v-model="settings.sms.hideSimBoxes">
            </b-checkbox>
          </config-field>
          <config-field
            :label="$i18n('options_labels_general_confirmDialogsToShow')"
            :description="$i18n('options_descriptions_general_confirmDialogsToShow')">
            <b-checkbox
              v-model="settings.sms.confirmDialogsToShow"
              native-value="delete">
              {{ $i18n('sms_action_delete') }}
            </b-checkbox>
            <b-checkbox
              v-model="settings.sms.confirmDialogsToShow"
              native-value="import">
              {{ $i18n('sms_action_import') }}
            </b-checkbox>
          </config-field>
          <config-field
            :label="$i18n('options_labels_sms_typeIcons')"
            :description="$i18n('options_descriptions_sms_typeIcons')">
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
          {{ $i18n('options_button_save') }}
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
          message: this.$i18n('options_save_success'),
          type: 'is-success',
        });
      } catch (e) {
        this.$toast.open({
          message: this.$i18n('options_save_error'),
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
