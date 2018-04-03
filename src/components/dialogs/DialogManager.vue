<template></template>

<script>
import Vue from 'vue';

export default {
  props: {
    bus: {
      type: Object,
      validator(val) {
        return val instanceof Vue;
      },
    },
  },
  data() {
    return {
      dialogs: {},
    };
  },
  mounted() {
    this.bus.$on('open-alert-dialog', this.alert);
    this.bus.$on('open-confirm-dialog', this.confirm);
    this.bus.$on('open-prompt-dialog', this.prompt);
    this.bus.$on('close-dialogs', this.closeDialogs);
  },
  methods: {
    closeDialogs(category) {
      if (category in this.dialogs) {
        for (const dialog of this.dialogs[category]) {
          dialog.close();
        }
        this.dialogs[category] = [];
      }
    },
    processdata(data={}) {
      if (['warning', 'info', 'danger', 'success'].includes(data.type) && !('hasIcon' in data)) {
        data.hasIcon = true;
      }
      data.type = 'is-'+data.type;
      const defaults = {};
      defaults.confirmText = this.$i18n('generic_ok');
      defaults.cancelText = this.$i18n('generic_cancel');
      return Object.assign(defaults, data);
    },
    openDialog(type, data) {
      data = this.processdata(data);
      if (!(data.category in this.dialogs)) {
        this.dialogs[data.category] = [];
      }
      this.dialogs[data.category].push(this.$dialog[type](data));
    },
    alert(data) {
      this.openDialog('alert', data);
    },
    confirm(data) {
      this.openDialog('confirm', data);
    },
    prompt(data) {
      this.openDialog('prompt', data);
    },
  },
};
</script>
