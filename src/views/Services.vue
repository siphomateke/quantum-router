<template>
  <div class="page-content padding-container">
    <form
      v-if="$adminMode"
      @submit.prevent>
      <b-field :label="$i18n('services_ussd_command')">
        <b-input
          v-model="ussd.content"
          type="text"/>
      </b-field>
      <b-field
        v-if="ussd.commands.length > 0"
        :label="$i18n('services_ussd_presets')">
        <b-select
          :value="ussd.selectedCommand"
          @input="ussdSelectedCommandChanged">
          <option value="">--</option>
          <option
            v-for="command in ussd.commands"
            :value="command.Command"
            :key="command.Command"
          >{{ command.Name }}</option>
        </b-select>
      </b-field>
      <b-message
        v-if="error"
        type="is-danger"
        has-icon>{{ error }}</b-message>
      <div
        v-if="ussd.result.length > 0 || ussdOptionsExist"
        class="box">
        <p style="white-space: pre-wrap;">{{ ussd.result }}</p>
        <template v-for="(option, key) in ussd.options">
          <b-radio
            :key="key"
            :value="ussd.selectedOption"
            :native-value="key"
            @input="ussdSelectedOptionChanged">
            {{ key + '. ' + option }}
          </b-radio>
          <br :key="key">
        </template>
      </div>
      <button
        :class="{'is-loading': loading}"
        :disabled="ussd.content.length === 0"
        class="button is-primary"
        @click="send">{{ $i18n('generic_send') }}</button>
      <button
        v-show="loading"
        :disabled="cancelling"
        class="button is-danger"
        @click="cancel">{{ $i18n('generic_cancel') }}</button>
    </form>
    <template v-else>
      <b-message
        type="is-info"
        has-icon>
        {{ $i18n('services_admin_only') }}
      </b-message>
    </template>
  </div>
</template>

<script>
import router from 'huawei-router-api/browser';

const { RouterError } = router.errors;

export default {
  data() {
    return {
      ussd: {
        content: '',
        result: '',
        commands: [],
        selectedCommand: '',
        options: [],
        selectedOption: null,
        // TODO: Add extra fields depending on selected command
      },
      loading: false,
      error: '',
      cancelling: false,
      ussdResultRequest: null,
    };
  },
  computed: {
    ussdOptionsExist() {
      return Object.keys(this.ussd.options).length > 0;
    },
  },
  watch: {
    'ussd.selectedCommand': function (val) {
      if (val.length === 0) {
        this.ussd.content = '';
      }
    },
  },
  mounted() {
    if (this.$adminMode) {
      this.refreshAdmin();
    }
    this.globalBus.$on('mode-change:admin', this.refreshAdmin);
  },
  beforeDestroy() {
    this.globalBus.$off('mode-change:admin', this.refreshAdmin);
  },
  methods: {
    ussdSelectedCommandChanged(command) {
      this.ussd.selectedCommand = command;
      if (command.length > 0) {
        this.ussd.content = this.ussd.selectedCommand;
      }
    },
    ussdSelectedOptionChanged(value) {
      this.ussd.selectedOption = value;
      this.ussd.content = this.ussd.selectedOption;
    },
    async refreshAdmin() {
      try {
        // TODO: Show when this is loading
        const config = await router.config.getUssdConfig();
        this.ussd.commands = config.General.Menu.MenuItem;
      } finally {
        router.ussd.releaseUssd();
      }
    },
    resetCommandResult() {
      this.ussd.result = '';
      this.ussd.options = [];
      this.ussd.selectedOption = null;
    },
    addMessage(message) {
      const parsed = router.ussd.parse(message);
      this.ussd.result = parsed.content;
      this.ussd.options = parsed.options;
    },
    async _send() {
      try {
        await router.ussd.sendUssdCommand(this.ussd.content);
        if (this.cancelling) return;
        // Store reference to request so it can be cancelled
        this.ussdResultRequest = new router.ussd.UssdResultRequest();
        const data = await this.ussdResultRequest.send();
        this.ussdResultRequest = null;
        if (this.cancelling) return;
        this.addMessage(data.content);
        this.ussd.selectedCommand = '';
        this.ussd.content = '';
      } catch (e) {
        if (!(e instanceof RouterError && e.code === 'ussd_cancelled')) {
          this.error = e.message;
        }
      }
    },
    async send() {
      // TODO: release USSD if selectedCommand has changed
      this.loading = true;
      this.error = '';
      this.resetCommandResult();
      await this._send();
      if (this.cancelling) {
        // TODO: Use Vuex
        await router.ussd.releaseUssd();
      }
      this.cancelling = false;
      this.loading = false;
    },
    cancel() {
      this.cancelling = true;
      if (this.ussdResultRequest) {
        this.ussdResultRequest.cancel();
      }
    },
  },
};
</script>
