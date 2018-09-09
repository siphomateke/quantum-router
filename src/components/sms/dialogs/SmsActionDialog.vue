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
      <b-collapse
        :open="false"
        class="card">
        <div
          slot="trigger"
          slot-scope="props"
          class="card-header">
          <p class="card-header-title">
            {{ $i18n(props.open ? 'sms.actionDialog.hideMessages' : 'sms.actionDialog.showMessages') }}
          </p>
          <a class="card-header-icon">
            <b-icon
              :icon="props.open ? 'caret-up' : 'caret-down'"/>
          </a>
        </div>
        <div class="card-content">
          <sms-list
            :list="list"/>
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
  name: 'QSmsActionDialog',
  components: {
    SmsList,
    [Dialog.name]: Dialog,
  },
  inheritAttrs: false,
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    confirmButton: {
      type: String,
      default: i18n.getMessage('sms.actionDialog.confirmText'),
    },
    confirmMessage: {
      type: String,
      default: null,
    },
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
