<template>
  <q-dialog
    v-bind="$attrs"
    :confirm-text="confirmButton"
    @confirm="confirm"
    @cancel="cancel">
    <slot name="base">
      <p><slot>{{ confirmMessage }}</slot></p>
    </slot>
    <template slot="extra">
      <b-collapse class="card" :open="false">
        <div class="card-header" slot="trigger" slot-scope="props">
            <p class="card-header-title">
              {{ $i18n(props.open ? 'sms_action_dialog_hide_messages' : 'sms_action_dialog_show_messages') }}
            </p>
            <a class="card-header-icon">
                <b-icon
                    :icon="props.open ? 'caret-up' : 'caret-down'">
                </b-icon>
            </a>
        </div>
        <div class="card-content">
          <sms-list
            :list="list">
          </sms-list>
        </div>
      </b-collapse>
    </template>
  </q-dialog>
</template>

<script>
import SmsList from '@/components/sms/SmsList.vue';
import Dialog from '@/components/dialogs/Dialog.vue';
import i18n from '@/platform/i18n';

export default {
  name: 'q-sms-action-dialog',
  inheritAttrs: false,
  components: {
    SmsList,
    [Dialog.name]: Dialog,
  },
  props: {
    list: Array,
    confirmButton: {
      type: String,
      default: i18n.getMessage('sms_action_dialog_confirm_text'),
    },
    confirmMessage: String,
  },
  methods: {
    confirm() {
      this.$emit('confirm');
      // Pass an argument to the close event so we can differentiate
      // pressing confirm from clicking 'X' / pressing escape / clicking outside
      this.$emit('close', 'confirm');
    },
    cancel() {
      this.$emit('cancel');
      this.$emit('close');
    },
  },
};
</script>
