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
    <b-field
      :label="this.$i18n('sms_dialog_field_content')"
      :addons="false">
      <b-input
        type="textarea"
        v-model="internalContent"
        :maxlength="sms7bitMaxSize"
        :has-counter="false">
      </b-input>
      <small class="help">
        <span>
          <span
            class="help-cursor"
            :title="this.$i18n('sms_dialog_character_count')">
            {{ internalContent.length }}
          </span>
          {{' / '}}
          <span
            class="help-cursor"
            :title="this.$i18n('sms_dialog_character_count_max')">
            {{ sms7bitMaxSize }}
          </span>
        </span>
        <span class="counter help-cursor">
          <span :title="this.$i18n('sms_dialog_remaining_characters_in_segment')">{{ counterText.remaining }}</span>
          <span :title="this.$i18n('sms_dialog_message_count')">({{ counterText.numberOfMessages }})</span>
          <span :title="this.$i18n('sms_dialog_segment_help', normalMax, longMax)">
            <b-icon icon="question-circle"></b-icon>
          </span>
        </span>
      </small>
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
    index: Number,
    numbers: Array,
    content: String,
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
      // TODO: Figure these out from the API
      normalMax: 160,
      longMax: 153,
      sms7bitMaxSize: 612,
    };
  },
  computed: {
    counterText() {
      // TODO: Support non english character encodings
      const length = this.internalContent.length;
      let remaining = null;
      let numberOfMessages = null;
      if (length <= this.normalMax) {
        remaining = this.normalMax - length;
        numberOfMessages = 1;
      } else {
        numberOfMessages = Math.ceil(length / this.longMax);
        remaining = (numberOfMessages * this.longMax) - length;
      }
      return {remaining, numberOfMessages};
    },
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

<style lang="scss" scoped>
  .counter {
    float: right;
  }
</style>
