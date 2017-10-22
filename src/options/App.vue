<template>
  <form style="padding:1em;" ref="form" v-on:submit.prevent>
    <b-field
    label="Router url"
    :type="routerUrl.type"
    :message="routerUrl.message">
        <b-input v-model="routerUrl.value" placeholder="URL" type="url" :loading="pinging"></b-input>
    </b-field>
    <b-field label="Username">
        <b-input v-model="username" placeholder="" type="text"></b-input>
    </b-field>
    <b-field label="Password">
        <b-input v-model="password" placeholder="" type="password" password-reveal></b-input>
    </b-field>
    <button @click="save" class="button is-primary" :class="{'is-loading': formLoading}">Save</button>
    <button @click="cancel" class="button">Cancel</button>
  </form>
</template>

<script>
/* global chrome */
import {RouterController} from '@/chrome/router.js';

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
    };
  },
  mounted() {
    RouterController.getStorage(['routerUrl', 'username', 'password']).then((items) => {
      if ('routerUrl' in items) {
        this.routerUrl.value = items.routerUrl;
      }
      if ('username' in items) {
        this.username = items.username;
      }
      if ('password' in items) {
        this.password = items.password;
      }
    });
  },
  watch: {
    'routerUrl.value'() {
      this.routerUrl.type = '';
      this.routerUrl.message = '';
    },
  },
  methods: {
    testRouterUrl() {
      return new Promise((resolve, reject) => {
        this.routerUrl.type = '';
        this.routerUrl.message = '';
        this.pinging = true;
        RouterController.ping(this.routerUrl.value).then(() => {
          this.routerUrl.type = 'is-success';
          this.routerUrl.message = '';
          this.pinging = false;
          return resolve(true);
        }).catch(() => {
          this.routerUrl.type = 'is-danger';
          this.routerUrl.message = 'Cannot connect to specified URL.';
          this.pinging = false;
          return reject(false);
        });
      });
    },
    save() {
      if (this.$refs.form.checkValidity()) {
        this.formLoading = true;
        this.testRouterUrl().then(() => {
          this.formLoading = false;
          chrome.storage.sync.set({
            routerUrl: this.routerUrl.value,
            username: this.username,
            password: this.password,
          }, () => {
            window.close();
          });
        }).catch(() => {
          this.formLoading = false;
        });
      }
    },
    cancel() {
      window.close();
    },
  },
};
</script>

<style lang="scss">
@import "~styles/vars";

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";
@import "~styles/bulma-extensions";
</style>
