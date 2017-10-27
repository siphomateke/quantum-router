<template>
<div class="box">
  <form v-on:submit.prevent v-if="$adminMode">
    <b-field label="USSD Command">
      <b-input v-model="ussd" type="text"></b-input>
    </b-field>
    <b-field v-if="ussdCommands.length > 0">
      <b-select v-model="selectedUssdCommand">
        <option
          v-for="command in ussdCommands"
          :value="command.Command"
          :key="command.Command"
          >{{ command.Name }}</option>
      </b-select>
    </b-field>
    <b-message type="is-danger" has-icon v-if="error">{{ error }}</b-message>
    <div class="box" v-if="ussdResult.length > 0 || Object.keys(ussdOptions).length > 0">
      <p style="white-space: pre-wrap;">{{ ussdResult }}</p>
      <template v-for="(option, key) in ussdOptions">
        <b-radio :key="key"
          :value="selectedUssdOption"
          @input="selectedUssdOptionChanged"
          :native-value="key">
            {{ key + '. ' + option }}
        </b-radio>
        <br>
      </template>
    </div>
    <button @click="send" class="button is-primary" :class="{'is-loading': loading}">Send</button>
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
      ussd: '',
      loading: false,
      ussdResult: '',
      ussdCommands: [],
      selectedUssdCommand: '',
      ussdOptions: [],
      selectedUssdOption: null,
      error: '',
    };
  },
  watch: {
    '$mode'() {
      this.refresh();
    },
    selectedUssdCommand(command) {
      this.ussd = command;
    },
  },
  mounted() {
    this.refresh();
    RouterController.releaseUssd();
  },
  methods: {
    selectedUssdOptionChanged(value) {
      this.selectedUssdOption = value;
      this.ussd = this.selectedUssdOption;
    },
    refresh() {
      if (this.$adminMode) {
        RouterController.getUssdConfig().then((config) => {
          this.ussdCommands = config.USSD.General.Menu.MenuItem;
        });
      }
    },
    send() {
      this.loading = true;
      this.error = '';
      this.selectedUssdOption = null;
      RouterController.sendUssdCommand(this.ussd).then((data) => {
        let parsed = UssdUtils.parse(data.content);
        this.ussdResult = parsed.content;
        this.ussdOptions = parsed.options;
        this.ussd = '';
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
