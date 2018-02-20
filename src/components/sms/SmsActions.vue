<template>
  <div class="level is-mobile">
    <div class="level-left">
      <!-- TODO: Make action buttons show loading progress -->
      <b-field grouped>
        <b-field>
          <action-button
            v-if="isVisible('clearChecked')"
            :disabled="isDisabled('clearChecked')"
            :label="this.$i18n('sms_action_clear_checked')"
            icon="times" type="is-danger"
            @click="clearChecked">
          </action-button>
        </b-field>

        <b-field>
          <action-button
            v-if="isVisible('delete')"
            :disabled="isDisabled('delete')"
            icon="trash"
            @click="deleteMessages">
          </action-button>
          <action-button
            v-if="isVisible('markAsRead')"
            :disabled="isDisabled('markAsRead')"
            :label="this.$i18n('sms_action_mark_as_read')"
            @click="markMessagesAsRead">
          </action-button>
        </b-field>
      </b-field>
    </div>

    <div class="level-right">
      <b-field grouped>
        <b-field>
          <action-button
            v-if="isVisible('new')"
            :disabled="isDisabled('new')"
            :label="this.$i18n('sms_action_new_message')"
            icon="plus" type="is-primary"
            @click="newMessage">
          </action-button>
        </b-field>
        <b-field>
          <action-button
            v-if="isVisible('import')"
            :disabled="isDisabled('import')"
            :label="this.$i18n('sms_action_import')"
            icon="upload"
            @click="importClick">
          </action-button>
        </b-field>
      </b-field>
    </div>
  </div>
</template>

<script>
import ActionButton from '@/components/ActionButton.vue';

export default {
  components: {
    ActionButton,
  },
  props: {
    'checked-rows': Array,
    'disabled': Object,
    'hidden': Object,
    'bus': Object,
  },
  methods: {
    isVisible(name) {
      return !this.hidden[name];
    },
    isDisabled(name) {
      return this.disabled[name];
    },
    clearChecked() {
      this.bus.$emit('sms-actions:clear-checked');
    },
    deleteMessages() {
      this.bus.$emit('sms-actions:delete');
    },
    markMessagesAsRead() {
      this.bus.$emit('sms-actions:mark-as-read');
    },
    newMessage() {
      this.bus.$emit('sms-actions:new');
    },
    importClick() {
      this.bus.$emit('sms-actions:import');
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
