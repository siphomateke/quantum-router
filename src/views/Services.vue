<template>
<div class="box">
  <form v-on:submit.prevent>
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
    <div class="box">
      <p style="white-space: pre-wrap;">{{ ussdResult }}</p>
      <template v-for="(option, key) in ussdOptions">
        <b-radio :key="key"
          v-model="selectedUssdOption"
          :native-value="key">
            {{ key + '. ' + option }}
        </b-radio>
        <br>
      </template>
    </div>
    <button @click="send" class="button is-primary" :class="{'is-loading': loading}">Send</button>
  </form>
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
    };
  },
  watch: {
    '$mode'() {
      this.refresh();
    },
    selectedUssdOption(key) {
      this.ussd = key;
    },
    selectedUssdCommand(command) {
      this.ussd = command;
    },
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      if (this.$adminMode) {
        RouterController.getUssdConfig().then((config) => {
          this.ussdCommands = config.USSD.General.Menu.MenuItem;
        });
      }
    },
    send() {
      this.loading = true;
      RouterController.sendUssdCommand(this.ussd).then((data) => {
        let parsed = UssdUtils.parse(data.content);
        this.ussdResult = parsed.content;
        this.ussdOptions = parsed.options;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
