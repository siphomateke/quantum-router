<template>
<div>
  <nav class="navbar has-shadow">
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item is-tab is-active">Basic</a>
        <a class="navbar-item is-tab">Advanced</a>
        <a class="navbar-item is-tab">MAC Filter</a>
        <a class="navbar-item is-tab">WPS</a>
      </div>
    </div>
  </nav>

  <div class="section">
    <h3 class="title is-3">Basic settings</h3>
    <p class="content">
      WPS is not available if security mode is set to WEP. If security mode is set to WEP, a wireless network adapter working only in 802.11n mode may not be able to access the device.
    </p>
    <div class="field">
      <b-switch>WLAN module</b-switch>
    </div>

    <b-table
      :data="data"
      :bordered="true"
      :striped="true"
      :mobile-cards="true">

      <template scope="props">
          <b-table-column label="SSID">{{ props.row.ssid }}</b-table-column>
          <b-table-column label="Security mode">{{ props.row.security }}</b-table-column>
          <b-table-column label="Status">
            <div class="field">
              <b-switch v-model="props.row.status">{{ getStatusString(props.row.status) }}</b-switch>
            </div>
          </b-table-column>
      </template>

      <template slot="empty">
          <section class="section">
              <div class="content has-text-grey has-text-centered">
                  <p>
                      <b-icon
                          icon="sentiment_very_dissatisfied"
                          size="is-large">
                      </b-icon>
                  </p>
                  <p>Nothing here.</p>
              </div>
          </section>
      </template>
    </b-table>
  </div>
</div>
</template>

<script>
  export default {
    data() {
      return {
        data: [
          {'ssid' : 'HUAWEI-B315-6DEE', 'security': 'WPA2-PSK', 'status': true},
          {'ssid' : 'HUAWEI-B315-6DEE-1', 'security': 'WPA2-PSK', 'status': false},
          {'ssid' : 'HUAWEI-B315-6DEE-2', 'security': 'WPA2-PSK', 'status': false},
          {'ssid' : 'HUAWEI-B315-6DEE-3', 'security': 'WPA2-PSK', 'status': false},
        ]
      }
    },
    methods: {
      getStatusString: (status) => {
        return status ? 'On' : 'Off'
      }
    }
  }
</script>
