<template>
<div class="section">
  <div class="columns">
    <div class="column">
      <b-panel>
        <h5 slot="header" class="title is-5">Connection</h5>
        <div class="content">
          <div class="field">
            <b-switch>Mobile data</b-switch>
          </div>
          <div class="field">
            <b-switch>Data roaming</b-switch>
          </div>
        </div>
      </b-panel>
    </div>

    <div class="column">
      <b-panel>
        <h5 slot="header" class="title is-5">Network</h5>
        <div class="content">
          <div class="field">
            <b-switch>Support LTE networks</b-switch>
          </div>
          <b-field label="Search mode">
            <b-select v-model="values.networkSearchMode">
              <option v-for="option in networkSearchModes" :value="option.value" :key="option.value">
                {{ option.label }}
              </option>
            </b-select>
          </b-field>
        </div>
      </b-panel>
    </div>
  </div>

  <button class="button is-primary">Apply</button>

</div>
</template>

<script>
  export default {
    name: 'SettingsDialUp',
    data() {
      return {
        networkSearchModes: [
          {value: 'auto', label: 'Auto'},
          {value: 'manual', label: 'Manual'},
        ],
        values: {
          networkSearchMode: 'auto',
        },
      };
    },
  };
</script>
