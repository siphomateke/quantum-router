<template>
<div class="box">
  <form v-on:submit.prevent>
    <b-field label="USSD Command">
      <b-input v-model="ussd" type="text"></b-input>
    </b-field>
    <button @click="send" class="button is-primary" :class="{'is-loading': loading}">Send</button>
  </form>
  <br>
  <section class="box" :class="{'is-loading': loading}">
    <p style="white-space: pre-wrap;">
      {{ ussdResult }}
    </p>
  </section>
</div>
</template>

<script>
import {RouterController} from '@/chrome/router.js';

export default {
  data() {
    return {
      ussd: '',
      loading: false,
      ussdResult: '',
      ussdCommands: [],
    };
  },
  watch: {
    '$mode'() {
      this.refresh();
    },
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      if (this.adminMode) {
        RouterController.getUssdConfig().then((config) => {
          this.ussdCommands = config.USSD.General.Menu.MenuItem;
        });
      }
    },
    send() {
      this.loading = true;
      RouterController.sendUssdCommand(this.ussd).then((data) => {
        this.ussdResult = data.content;
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
