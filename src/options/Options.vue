<template>
  <form style="padding:1em;" ref="form" v-on:submit.prevent>
    <b-field
    :label="'options_field_router_url' | $i18n"
    :type="routerUrl.type"
    :message="routerUrl.message">
        <b-input v-model="routerUrl.value" type="url" :loading="pinging" @blur="onBlurRouterUrl"></b-input>
    </b-field>
    <b-field :label="'options_field_admin_username' | $i18n">
        <b-input v-model="username" type="text"></b-input>
    </b-field>
    <b-field :label="'options_field_admin_password' | $i18n">
        <b-input v-model="password" type="password" password-reveal></b-input>
    </b-field>
    <button @click="save" class="button is-primary" :class="{'is-loading': formLoading}">{{ 'options_button_save' | $i18n}}</button>
    <hr v-if="message.visible">
    <b-message :active="message.visible" :type="message.type">{{ message.content }}</b-message>
  </form>
</template>

<script>
/* global browser */
import router from 'huawei-router-api/browser';

export default {
  name: 'app',
  data() {
    return {
      routerUrl: {
        value: '',
        type: '',
        message: '',
      },
      username: '',
      password: '',
      pinging: false,
      formLoading: false,
      message: {
        type: '',
        visible: false,
        content: '',
        timer: null,
      },
    };
  },
  async mounted() {
    const items = await browser.storage.sync.get(['routerUrl', 'username', 'password']);
    if ('routerUrl' in items) {
      this.routerUrl.value = items.routerUrl;
    }
    if ('username' in items) {
      this.username = items.username;
    }
    if ('password' in items) {
      this.password = items.password;
    }
  },
  watch: {
    'routerUrl.value'() {
      this.routerUrl.type = '';
      this.routerUrl.message = '';
    },
  },
  methods: {
    async testRouterUrl() {
      this.routerUrl.type = '';
      this.routerUrl.message = '';
      this.pinging = true;
      try {
        await router.utils.ping(this.routerUrl.value);
        this.routerUrl.type = 'is-success';
        this.routerUrl.message = '';
      } catch (e) {
        this.routerUrl.type = 'is-danger';
        this.routerUrl.message = this.$i18n('options_error_ping');
      } finally {
        this.pinging = false;
      }
    },
    async save() {
      if (this.$refs.form.checkValidity()) {
        try {
          await browser.storage.sync.set({
            routerUrl: this.routerUrl.value,
            username: this.username,
            password: this.password,
          });
          this.showMessage(this.$i18n('options_save_success'), 'is-success');
          browser.runtime.sendMessage({
            from: 'options',
            status: 'saved',
          });
        } catch (e) {
          this.showMessage(this.$i18n('generic_error', e.message), 'is-danger');
        }
      }
    },
    showMessage(message, type, timer=5000) {
      clearTimeout(this.message.timer);
      this.message.type = type;
      this.message.content = message;
      this.message.visible = true;
      this.message.timer = setTimeout(() => {
        this.message.type = '';
        this.message.content = '';
        this.message.visible = false;
      }, timer);
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

<style lang="scss">
@import "~styles/global-base";
</style>
