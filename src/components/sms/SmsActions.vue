<template>
  <div class="level">
    <div class="level-left">
      <!-- TODO: Make action buttons show loading progress -->
      <b-field grouped>
        <b-field :title="this.$i18n('sms_action_select_tooltip')">
          <p class="control">
            <button
              class="button"
              @click="toggleSelection">
              <b-icon :icon="selectionState === selectionStates.NONE ? 'square-o' : 'check-square-o'"/>
            </button>
          </p>
          <p class="control">
            <b-dropdown>
              <button
                slot="trigger"
                class="button">
                <b-icon icon="caret-down"/>
              </button>
              <b-dropdown-item
                v-for="selector in selectors"
                :key="selector"
                @click="changeSelection(selector)">
                {{ $i18n('sms_action_select_'+selector) }}
              </b-dropdown-item>
              <b-dropdown-item separator/>
              <b-dropdown-item custom>
                <b>{{ $i18n('sms_action_select_dropdown_types_group') }}</b>
              </b-dropdown-item>
              <b-dropdown-item
                v-for="smsType in smsTypes"
                :key="smsType"
                @click="changeSelection(smsType)">
                <b-icon
                  :pack="smsTypeIcons[smsType].pack"
                  :icon="smsTypeIcons[smsType].id"/>
                <span style="padding-left:0.5em;">{{ getSmsTypeName(smsType) }}</span>
              </b-dropdown-item>
            </b-dropdown>
          </p>
        </b-field>

        <b-field>
          <action-button
            v-if="isVisible('delete')"
            :disabled="isDisabled('delete')"
            :title="this.$i18n('sms_action_delete')"
            icon="trash"
            @click="deleteMessages"/>
          <action-button
            v-if="isVisible('markAsRead')"
            :disabled="isDisabled('markAsRead')"
            :label="this.$i18n('sms_action_mark_as_read')"
            @click="markMessagesAsRead"/>
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
            icon="plus"
            @click="newMessage"/>
        </b-field>
        <b-field>
          <action-button
            v-if="isVisible('import')"
            :disabled="isDisabled('import')"
            :label="this.$i18n('sms_action_import')"
            icon="upload"
            @click="importClick"/>
        </b-field>
      </b-field>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import ActionButton from '@/components/ActionButton.vue';
import smsTypeMixin from '@/mixins/smsType';
import router from 'huawei-router-api/browser';
import { selectors, selectionStates } from './select';

const smsTypes = router.sms.types;

// TODO: Consider using these to generate events
const actions = [
  'delete',
  'markAsRead',
  'new',
  'import',
];

function actionOptionValidator(value) {
  if (typeof value !== 'object') return false;
  let anyInvalid = false;
  for (const key of Object.keys(value)) {
    if (!actions.includes(key) || typeof value[key] === 'boolean') {
      anyInvalid = true;
      break;
    }
  }
  return !anyInvalid;
}

/**
 * Events
 *
 * delete
 * mark-as-read
 * new
 * import
 * select-all
 * clear-selection TODO: Decide if this event should be renamed to match store
 * select {read, type}
 */
export default {
  components: {
    ActionButton,
  },
  mixins: [smsTypeMixin],
  props: {
    checkedRows: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Object,
      default: () => ({}),
      validator: actionOptionValidator,
    },
    hidden: {
      type: Object,
      default: () => ({}),
      validator: actionOptionValidator,
    },
    selectionState: {
      type: String,
      default: selectionStates.NONE,
      validator: val => Object.values(selectionStates).includes(val),
    },
    bus: {
      type: Object,
      default: null,
      validator: val => val instanceof Vue,
    },
  },
  data() {
    return {
      smsTypes,
      selectors,
      selectionStates,
    };
  },
  methods: {
    isVisible(name) {
      return !this.hidden[name];
    },
    isDisabled(name) {
      return this.disabled[name];
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
    // Possible issue: this isn't run on mount
    toggleSelection() {
      if (this.selectionState !== selectionStates.NONE) {
        this.changeSelection(selectors.NONE);
      } else {
        this.changeSelection(selectors.ALL);
      }
    },
    changeSelection(selector) {
      switch (selector) {
        case selectors.ALL:
          this.bus.$emit('sms-actions:select-all');
          break;
        case selectors.NONE:
          this.bus.$emit('sms-actions:clear-selection');
          break;
        case selectors.READ:
          this.bus.$emit('sms-actions:select', { read: true });
          break;
        case selectors.UNREAD:
          this.bus.$emit('sms-actions:select', { read: false });
          break;
        default:
          // do nothing
      }
      if (Object.values(smsTypes).includes(selector)) {
        this.bus.$emit('sms-actions:select', { type: selector });
      }
    },
  },
};
</script>
