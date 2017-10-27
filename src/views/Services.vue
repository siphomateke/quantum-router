<template>
<div class="box">
  <form v-on:submit.prevent v-if="$adminMode">
    <b-field label="USSD Command">
      <b-input v-model="ussd.content" type="text"></b-input>
    </b-field>
    <b-field v-if="ussd.commands.length > 0" label="USSD Presets">
      <b-select :value="ussd.selectedCommand" @input="ussdSelectedCommandChanged">
        <option value="">--</option>
        <option
          v-for="command in ussd.commands"
          :value="command.Command"
          :key="command.Command"
          >{{ command.Name }}</option>
      </b-select>
    </b-field>
    <b-message type="is-danger" has-icon v-if="error">{{ error }}</b-message>
    <div class="box" v-if="ussd.result.length > 0 || ussdOptionsExist">
      <p style="white-space: pre-wrap;">{{ ussd.result }}</p>
      <template v-for="(option, key) in ussd.options">
        <b-radio :key="key"
          :value="ussd.selectedOption"
          @input="ussdSelectedOptionChanged"
          :native-value="key">
            {{ key + '. ' + option }}
        </b-radio>
        <br>
      </template>
    </div>
    <button @click="send"
    class="button is-primary"
    :class="{'is-loading': loading}"
    :disabled="ussd.content.length === 0">Send</button>
  </form>
  <template v-else>
    <b-message type="is-info" has-icon>
      You must be in administrator mode to access USSD services
    </b-message>
  </template>
</div>
</template>

<script>
import {RouterController, UssdUtils} from '@/chrome/router.js';

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
      },
      loading: false,
      error: '',
    };
  },
  computed: {
    ussdOptionsExist() {
      return Object.keys(this.ussd.options).length > 0;
    },
  },
  watch: {
    '$mode'() {
      this.refresh();
    },
    ussd(value) {
      if (value !== this.ussd.selectedCommand && this.ussd.selectedCommand.length > 0) {
        this.ussd.selectedCommand = '';
      }
    },
  },
  mounted() {
    this.refresh();
    RouterController.releaseUssd();
  },
  methods: {
    ussdSelectedCommandChanged(command) {
      this.ussd.selectedCommand = command;
      this.ussd.content = this.ussd.selectedCommand;
    },
    ussdSelectedOptionChanged(value) {
      this.ussd.selectedOption = value;
      this.ussd.content = this.ussd.selectedOption;
    },
    refresh() {
      if (this.$adminMode) {
        RouterController.getUssdConfig().then((config) => {
          this.ussd.commands = config.USSD.General.Menu.MenuItem;
        });
      }
    },
    send() {
      this.loading = true;
      this.error = '';
      RouterController.sendUssdCommand(this.ussd.content).then((data) => {
        let parsed = UssdUtils.parse(data.content);
        this.ussd.result = parsed.content;
        this.ussd.options = parsed.options;
        this.ussd.selectedCommand = '';
        this.ussd.selectedOption = null;
        this.ussd.content = '';
        this.loading = false;
      }).catch((err) => {
        this.error = err;
        this.loading = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
