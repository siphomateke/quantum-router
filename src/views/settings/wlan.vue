<template>
<div>
  <section class="section">
    <h3 class="title is-3">Basic settings</h3>
    <p class="content">
      WPS is not available if security mode is set to WEP.<br>
      If security mode is set to WEP, a wireless network adapter working only in 802.11n mode may not be able to access the device.
    </p>
    <div class="field">
      <b-switch v-model="settings.basic.moduleEnabled">WLAN module</b-switch>
    </div>

    <div class="field">
      <b-switch v-model="editMode">Edit mode</b-switch>
    </div>

    <b-table
      :data="settings.basic.table"
      :bordered="true"
      :striped="true"
      :mobile-cards="true">

      <template slot-scope="props">
        <b-table-column label="SSID">
          <b-field v-if="editMode">
            <b-input v-model="props.row.ssid"></b-input>
          </b-field>
          <template v-if="!editMode">
            {{ props.row.ssid }}
          </template>
        </b-table-column>
        <b-table-column label="Security mode">
          <q-select
          v-if="editMode"
          :options="options.basic.table.security"
          v-model="props.row.security"></q-select>
          <template v-if="!editMode">
            {{ props.row.security }}
          </template>
        </b-table-column>
        <b-table-column label="Status">
          <div v-if="editMode" class="field">
            <b-switch v-model="props.row.status">{{ getStatusString(props.row.status) }}</b-switch>
          </div>
          <template v-if="!editMode">
            {{ getStatusString(props.row.status) }}
          </template>
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p><b-icon icon="frown-o" size="is-large"></b-icon></p>
            <p>Error!</p>
          </div>
        </section>
      </template>
    </b-table>
  </section>
  <section class="section">
    <h3 class="title is-3">Advanced settings</h3>
    <div class="columns">
      <div class="column">
        <q-select label="Channel"
        :options="options.advanced.channel"
        v-model="settings.advanced.channel"></q-select>
      </div>
      <div class="column">
        <q-select label="WiFi Bandwidth"
        :options="options.advanced.wifiBandwidth"
        v-model="settings.advanced.wifiBandwidth"></q-select>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="control">
      <button class="button is-primary" @click="apply">Apply</button>
    </div>
  </section>
</div>
</template>

<script>
import Select from '@/components/form/Select';

export default {
  name: 'SettingsWlan',
  components: {
    'q-select': Select,
  },
  data() {
    return {
      editMode: false,
      settings: {
        basic: {
          moduleEnabled: false,
          table: [
            {'ssid': 'HUAWEI-B315-6DEE', 'security': 'WPA2-PSK', 'status': true},
            {'ssid': 'HUAWEI-B315-6DEE-1', 'security': 'WPA2-PSK', 'status': false},
            {'ssid': 'HUAWEI-B315-6DEE-2', 'security': 'WPA2-PSK', 'status': false},
            {'ssid': 'HUAWEI-B315-6DEE-3', 'security': 'WPA2-PSK', 'status': false},
          ],
        },
        advanced: {
          channel: '0',
          wifiBandwidth: '0',
        },
      },
      options: {
        basic: {table: {security: [
          {label: 'WPA2-PSK', value: 'WPA2-PSK'},
        ]}},
        advanced: {
          channel: [
            {label: 'Auto', value: '0'},
            {label: '1', value: '1'},
            {label: '2', value: '2'},
            {label: '3', value: '3'},
            {label: '4', value: '4'},
            {label: '5', value: '5'},
            {label: '6', value: '6'},
            {label: '7', value: '7'},
            {label: '8', value: '8'},
            {label: '9', value: '9'},
            {label: '10', value: '10'},
            {label: '11', value: '11'},
            {label: '12', value: '12'},
            {label: '13', value: '13'},
          ],
          wifiBandwidth: [
            {label: 'Auto (default)', value: '0'},
            {label: '20MHz', value: '20'},
          ],
        },
      },
    };
  },
  methods: {
    getStatusString: status => {
      return status ? 'On' : 'Off';
    },
    apply() {

    },
  },
};
</script>
