<template>
  <q-dialog
    :title="this.$i18n('sms_dialog_title')"
    :confirm-text="this.$i18n('sms_dialog_action_send')"
    @confirm="send"
    @cancel="cancel"
  >
    <form
      ref="form"
      @submit.prevent>
      <b-field
        :label="this.$i18n('sms_dialog_field_numbers')"
        :type="fields.numbers.type"
        :message="fields.numbers.message">
        <b-taginput
          v-model="internalNumbers"
          :placeholder="this.$i18n('sms_dialog_field_numbers_placeholder')"
          icon="phone"
          @input="validateNumbers"/>
      </b-field>
      <b-field
        :label="this.$i18n('sms_dialog_field_content')"
        :addons="false">
        <b-input
          ref="content"
          v-model="internalContent"
          :maxlength="sms7bitMaxSize"
          :has-counter="false"
          type="textarea"/>
        <small class="help">
          <span>
            <span
              :title="this.$i18n('sms_dialog_character_count')"
              class="help-cursor">
              {{ internalContent.length }}
            </span>
            {{ ' / ' }}
            <span
              :title="this.$i18n('sms_dialog_character_count_max')"
              class="help-cursor">
              {{ sms7bitMaxSize }}
            </span>
          </span>
          <span class="counter help-cursor">
            <span :title="this.$i18n('sms_dialog_remaining_characters_in_segment')">{{ counterText.remaining }}</span>
            <span :title="this.$i18n('sms_dialog_message_count')">({{ counterText.numberOfMessages }})</span>
            <span :title="this.$i18n('sms_dialog_segment_help', {normalMax, longMax})">
              <b-icon icon="question-circle"/>
            </span>
          </span>
        </small>
      </b-field>
    </form>
    <template slot="buttons">
      <button
        class="button"
        @click="save">{{ this.$i18n('sms_dialog_action_save') }}</button>
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
  name: 'SmsDialog',
  components: {
    [Dialog.name]: Dialog,
  },
  props: {
    id: {
      type: Number,
      default: null,
    },
    numbers: {
      type: Array,
      default: () => [],
    },
    content: {
      type: String,
      default: '',
    },
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
      if (this.internalNumbers.length === 0) {
        this.fields.numbers.type = 'is-danger';
        this.fields.numbers.message = this.$i18n('validation_tag_input_required');
        return false;
      }
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
      return this.$refs.form.checkValidity() &&
        this.$refs.content.checkHtml5Validity() &&
        this.validateNumbers();
    },
    async send() {
      if (this.isValid()) {
        this.$emit('send', {
          numbers: this.numbers,
          content: this.content,
        });
      }
    },
    async save() {
      if (this.isValid()) {
        this.$emit('save', {
          index: this.id,
          numbers: this.numbers,
          content: this.content,
        });
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
