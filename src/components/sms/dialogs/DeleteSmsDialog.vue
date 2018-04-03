<template>
  <q-dialog
    type="is-danger"
    :has-icon="true"
    :confirm-text="$i18n('sms_action_delete')"
    @confirm="confirm"
    @cancel="cancel">
    <p>{{ $i18n('sms_delete_confirm', list.length) }}</p>
    <template slot="extra">
      <b-collapse class="card" :open="false">
        <div class="card-header" slot="trigger" slot-scope="props">
            <p class="card-header-title">
              {{ $i18n(props.open ? 'sms_delete_confirm_hide_messages' : 'sms_delete_confirm_show_messages') }}
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

export default {
  name: 'q-delete-sms-dialog',
  components: {
    SmsList,
    [Dialog.name]: Dialog,
  },
  props: {
    list: Array,
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
