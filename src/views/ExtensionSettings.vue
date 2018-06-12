<template>
  <div>
    <div class="box">
      <form @submit.prevent="submit">
        <h4 class="title is-4">Extension Settings</h4>
        <b-tabs>
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
              <b-checkbox v-model="settings.general.rememberPassword">
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
          <button class="button is-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
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
      settings: {
        general: {
          defaultMode: modes.ADMIN,
          rememberPassword: true,
        },
        sms: {
          hideSimBoxes: true,
          confirmDialogsToShow: ['delete', 'import'],
          typeIcons: {
            [smsTypes.RECHARGE]: {pack: 'fa', id: 'bolt'},
            [smsTypes.DATA]: {pack: 'fa', id: 'area-chart'},
            [smsTypes.DATA_PERCENT]: {pack: 'fa', id: 'pie-chart'},
            [smsTypes.ACTIVATED]: {pack: 'fa', id: 'lightbulb-o'},
            [smsTypes.DEPLETED]: {pack: 'fa', id: 'exclamation'},
            [smsTypes.AD]: {pack: 'fa', id: 'bullhorn'},
          },
        },
      },
    };
  },
  computed: {
    modes: () => modes,
    modeNames: () => modeNames,
    smsTypes: () => smsTypes,
  },
  methods: {
    submit() {

    },
  },
};
</script>
