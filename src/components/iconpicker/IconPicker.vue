<template>
  <div>
    <b-modal
      :active.sync="modalOpen"
      has-modal-card>
      <icon-picker-modal
        :icon-packs="iconPacks"
        v-model="icon"
        :title="pickerTitle"/>
    </b-modal>
    <b-field
      :type="fieldType"
      :message="errorMessage">
      <b-field
        v-if="!compact"
        :type="fieldType">
        <p class="control">
          <span
            :title="iconName"
            class="button is-static">
            <b-icon
              :pack="iconPackId"
              :icon="iconId"/>
          </span>
        </p>
        <b-select
          v-if="iconPacks.length > 1"
          :value="iconPackId"
          @input="iconPackSelectionChanged">
          <option
            v-for="pack in iconPacks"
            :value="pack.id"
            :key="pack.id">
            {{ pack.name }}
          </option>
        </b-select>
        <b-input
          :value="iconId"
          type="text"
          @input="setIconId"
          @blur="validate"/>
        <p class="control">
          <button
            type="button"
            class="button"
            @click="open">{{ pickerButtonText }}</button>
        </p>
      </b-field>
      <template v-else>
        <button
          type="button"
          class="button"
          @click="open">
          <b-icon
            :pack="iconPackId"
            :icon="iconId"
            :title="iconName"/>
          <span>{{ iconId }}</span>
        </button>
      </template>
    </b-field>
  </div>
</template>

<script>
// TODO: Improve validation messages; we don't need multiple nested fields.
// Perhaps make the root element a field so it's label can be modified
// from the outside
// TODO: Fix title attribute on static icon button when compact=false
// TODO: Add autocomplete to icon ID input
import IconPickerModal from './IconPickerModal';
import icons from '@/icons';
import i18n from '@/platform/i18n';

export default {
  name: 'QIconPicker',
  components: {
    IconPickerModal,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {
          id: '',
          pack: '',
        };
      },
      validator(value) {
        return typeof value.id === 'string'
            && typeof value.pack === 'string';
      },
    },
    compact: {
      type: Boolean,
      default: true,
    },
    pickerTitle: {
      type: String,
      default: i18n.getMessage('icon_picker_title'),
    },
    pickerButtonText: {
      type: String,
      default: i18n.getMessage('icon_picker_button'),
    },
  },
  data() {
    return {
      modalOpen: false,
      iconPacks: icons,
      errorMessage: '',
      icon: {
        id: '',
        pack: '',
      },
    };
  },
  computed: {
    iconId() {
      return this.icon === null ? '' : this.icon.id;
    },
    iconName() {
      return this.icon === null ? '' : this.icon.name;
    },
    iconPackId() {
      return this.icon === null ? '' : this.icon.pack;
    },
    fieldType() {
      return this.errorMessage.length > 0 ? 'is-danger' : '';
    },
  },
  watch: {
    value(icon) {
      this.setIcon(icon);
    },
    icon: {
      handler(value) {
        this.$emit('input', value);
      },
      deep: true,
    },
  },
  mounted() {
    this.setIcon(this.value);
  },
  methods: {
    open() {
      this.modalOpen = true;
    },
    getIcon(icon) {
      // TODO: Make this run less. It shouldn't run when an icons is selected
      // from the modal but does.
      const pack = this.iconPacks.find(pack => pack.id === icon.pack);
      if (typeof pack !== 'undefined') {
        const found = pack.icons.find(icon2 => icon2.id === icon.id);
        if (typeof found !== 'undefined') {
          return found;
        }
      }
      return null;
    },
    updateName() {
      const iconData = this.getIcon(this.icon);
      let name = '';
      if (iconData !== null) {
        name = iconData.name;
      }
      this.$set(this.icon, 'name', name);
    },
    setIcon(icon) {
      this.icon = icon;
      this.updateName();
    },
    setIconId(id) {
      this.$set(this.icon, 'id', id);
      this.updateName();
    },
    setIconPack(pack) {
      this.$set(this.icon, 'pack', pack);
      this.updateName();
    },
    iconPackSelectionChanged(pack) {
      this.setIconPack(pack);
      this.validate();
    },
    validate() {
      const invalid = this.getIcon(this.icon) === null;
      if (invalid) {
        this.errorMessage = 'Invalid icon';
      } else {
        this.errorMessage = '';
      }
    },
  },
};
</script>
