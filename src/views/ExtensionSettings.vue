<template>
<div class="page-content">
  <div class="padding-container">
    <h4 class="title is-4">{{ $i18n('options_header') }}</h4>
  </div>
  <form ref="form" @submit.prevent="submit">
    <b-tabs v-if="loadedSettings">
      <b-tab-item :label="$i18n('options_tabs_general')">
        <config-field :label="$i18n('options_labels_general_routerUrl')">
          <b-field
            :type="validation.routerUrl.type"
            :message="validation.routerUrl.message">
            <b-input
              v-model="settings.general.routerUrl"
              type="url"
              :loading="pinging"
              @blur="onBlurRouterUrl">
            </b-input>
          </b-field>
        </config-field>
        <config-field :label="$i18n('options_labels_general_loginDetails')">
          <b-field :label="$i18n('options_labels_general_username')">
            <b-input v-model="settings.general.username" type="text"></b-input>
          </b-field>
          <b-field :label="$i18n('options_labels_general_password')">
            <b-input v-model="settings.general.password" type="password" password-reveal></b-input>
          </b-field>
        </config-field>
        <config-field
          :label="$i18n('options_labels_general_defaultMode')"
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
        :class="{'is-loading': saving | formLoading}">
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
      validation: {
        routerUrl: {
          type: '',
          message: '',
        },
      },
      pinging: false,
      formLoading: false,
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
  watch: {
    'settings.general.routerUrl'() {
      this.validation.routerUrl.type = '';
      this.validation.routerUrl.message = '';
    },
  },
  methods: {
    async setSetting(path, value) {
      await this.$store.dispatch('settings/set', {path: 'internal.'+path, value});
    },
    showMessage(message, type) {
      this.$toast.open({message, type});
    },
    async submit() {
      if (this.$refs.form.checkValidity()) {
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
          this.showMessage(this.$i18n('options_save_success'), 'is-success');
        } catch (e) {
          this.showMessage(this.$i18n('options_save_error'), 'is-danger');
          this.$store.dispatch('handleError', e);
        } finally {
          this.saving = false;
        }
      }
    },
    async testRouterUrl() {
      this.validation.routerUrl.type = '';
      this.validation.routerUrl.message = '';
      this.pinging = true;
      try {
        await router.utils.ping(this.settings.general.routerUrl);
        this.validation.routerUrl.type = 'is-success';
        this.validation.routerUrl.message = '';
      } catch (e) {
        this.validation.routerUrl.type = 'is-danger';
        this.validation.routerUrl.message = this.$i18n('options_error_ping');
      } finally {
        this.pinging = false;
      }
    },
    async onBlurRouterUrl(val) {
      this.formLoading = true;
      try {
        await this.testRouterUrl();
      } finally {
        this.formLoading = false;
      }
    },
  },
};
</script>
