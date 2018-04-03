<template>
<q-dialog
  :title="this.$i18n('sms_dialog_title')"
  :confirm-text="this.$i18n('sms_dialog_action_send')"
  @confirm="send"
  @cancel="cancel"
  >
  <form ref="form" v-on:submit.prevent>
    <b-field
      :label="this.$i18n('sms_dialog_field_numbers')"
      :type="fields.numbers.type"
      :message="fields.numbers.message">
        <b-taginput
          v-model="internalNumbers"
          @input="validateNumbers"
          icon="phone"
          :placeholder="this.$i18n('sms_dialog_field_numbers_placeholder')">
        </b-taginput>
    </b-field>
    <b-field :label="this.$i18n('sms_dialog_field_content')">
      <b-input type="textarea" v-model="internalContent"></b-input>
    </b-field>
  </form>
  <template slot="buttons">
    <button class="button" @click="save">{{ this.$i18n('sms_dialog_action_save') }}</button>
  </template>
</q-dialog>
</template>

<script>
import Dialog from '@/components/dialogs/Dialog.vue';
import router from 'huawei-router-api/browser';

/**
 * Used for creating, editing and sending sms messages
 */
export default {
  name: 'sms-dialog',
  components: {
    [Dialog.name]: Dialog,
  },
  props: {
    'index': Number,
    'numbers': Array,
    'content': String,
  },
  data() {
    return {
      internalNumbers: this.numbers,
      internalContent: this.content,
      fields: {
        numbers: {
          type: '',
          message: '',
        },
      },
    };
  },
  watch: {
    numbers(val) {
      this.internalNumbers = val;
    },
    content(val) {
      this.internalContent = val;
    },
    internalNumbers(val) {
      this.$emit('update:numbers', val);
    },
    internalContent(val) {
      this.$emit('update:content', val);
    },
  },
  methods: {
    validateNumbers() {
      let valid = true;
      for (const number of this.internalNumbers) {
        if (isNaN(number)) {
          valid = false;
          this.fields.numbers.type = 'is-danger';
          this.fields.numbers.message = this.$i18n('validation_tag_input_number');
          break;
        }
      }
      if (valid) {
        this.fields.numbers.type = '';
        this.fields.numbers.message = '';
      }
      return valid;
    },
    isValid() {
      return this.$refs.form.checkValidity() && this.validateNumbers();
    },
    // TODO: Show send and save status, and allow cancelling. Requires task runner to be implemented
    async send() {
      if (this.isValid()) {
        // TODO: Handle errors
        await router.sms.sendSms({
          numbers: this.numbers,
          content: this.content,
        });
        this.$emit('send');
      }
    },
    async save() {
      if (this.isValid()) {
        // TODO: Handle errors
        await router.sms.saveSms({
          index: this.index,
          numbers: this.numbers,
          content: this.content,
        });
        this.$emit('save');
      }
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
