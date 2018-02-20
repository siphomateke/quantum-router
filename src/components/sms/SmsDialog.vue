<template>
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">{{ 'sms_dialog_title' | $i18n }}</p>
  </header>
  <section class="modal-card-body">
    <b-field :label="this.$i18n('sms_dialog_field_numbers')">
      <b-taginput
        v-model="numbers"
        icon="phone"
        :placeholder="this.$i18n('sms_dialog_field_numbers_placeholder')">
      </b-taginput>
    </b-field>
    <b-field :label="this.$i18n('sms_dialog_field_content')">
      <b-input type="textarea" v-model="content"></b-input>
    </b-field>
  </section>
  <footer class="modal-card-foot">
    <button class="button is-primary" @click="send">{{ 'sms_dialog_action_send' | $i18n }}</button>
    <button class="button" @click="save">{{ 'sms_dialog_action_save' | $i18n }}</button>
    <button class="button" @click="cancel">{{ 'sms_dialog_action_cancel' | $i18n }}</button>
  </footer>
</div>
</template>

<script>
/**
 * Used for creating new sms messages and editing drafts
 */
export default {
  name: 'sms-dialog',
  data() {
    return {
      numbers: [],
      content: '',
    };
  },
  methods: {
    send() {
      this.$emit('send', {numbers: this.numbers, content: this.content});
    },
    save() {
      this.$emit('save', {numbers: this.numbers, content: this.content});
    },
    cancel() {
      this.$parent.close();
    },
  },
};
</script>
