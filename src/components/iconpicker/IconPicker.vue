<template>
  <div>
    <b-modal
      :active.sync="modalOpen"
      has-modal-card>
      <icon-picker-modal
        :icon-packs="iconPacks"
        v-model="icon"
        :title="pickerTitle"
        :search-placeholder="$i18n('iconPicker.searchPlaceholder')"/>
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
            class="button is-static icon-preview">
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
        <b-autocomplete
          :data="autocompleteIcons"
          :value="iconId"
          field="id"
          @input="setIconId"
          @blur="validate">
          <template slot-scope="{option: icon}">
            <div class="media icon-autocomplete-list">
              <div class="media-left">
                <b-icon
                  :pack="icon.pack"
                  :icon="icon.id"
                />
              </div>
              <div class="media-content">
                <template v-for="component in getHighlightComponents(icon.id, iconIdLowerCase)">
                  <template v-if="component.highlight"><b>{{ component.content }}</b></template>
                  <template v-else>{{ component.content }}</template>
                </template>
              </div>
            </div>
          </template>
        </b-autocomplete>
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
import icons from '@/icons';
import i18n from '@/platform/i18n';
import { searchIcons, generateCacheId } from './search';
import IconPickerModal from './IconPickerModal.vue';

// TODO: Improve validation messages; we don't need multiple nested fields.
// Perhaps make the root element a field so it's label can be modified
// from the outside
// TODO: Update icon search index when an icon pack has been modified
export default {
  name: 'IconPicker',
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
      default: i18n.getMessage('iconPicker.title'),
    },
    pickerButtonText: {
      type: String,
      default: i18n.getMessage('iconPicker.button'),
    },
    autocompleteMax: {
      type: Number,
      default: 20,
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
    iconMetadata() {
      return this.getIconMetadata(this.icon);
    },
    iconId() {
      return this.icon === null ? '' : this.icon.id;
    },
    iconIdLowerCase() {
      return this.iconId.toLowerCase();
    },
    iconPackId() {
      return this.icon === null ? '' : this.icon.pack;
    },
    iconName() {
      return this.iconMetadata.name ? this.iconMetadata.name : '';
    },
    autocompleteIcons() {
      if (this.iconPackId && this.iconIdLowerCase) {
        const iconPack = this.getIconPackById(this.iconPackId);
        const options = {
          props: ['id'],
        };
        const cacheId = generateCacheId({ iconPackId: this.iconPackId, options });
        let filtered = searchIcons(cacheId, iconPack.icons, this.iconIdLowerCase, options);
        if (Number.isInteger(this.autocompleteMax)) {
          filtered = filtered.splice(0, this.autocompleteMax);
        }
        return filtered;
      }
      return [];
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
    getIconPackById(id) {
      return this.iconPacks.find(pack => pack.id === id);
    },
    findIcon(icon) {
      // TODO: Make this run less. It shouldn't run when an icons is selected
      // from the modal but does.
      const pack = this.getIconPackById(icon.pack);
      if (typeof pack !== 'undefined') {
        const found = pack.icons.find(icon2 => icon2.id === icon.id);
        if (typeof found !== 'undefined') {
          return found;
        }
      }
      return null;
    },
    getIconMetadata(icon) {
      const foundIcon = this.findIcon(icon);
      return foundIcon !== null ? foundIcon : {};
    },
    setIcon(icon) {
      this.icon = icon;
    },
    setIconId(id) {
      this.$set(this.icon, 'id', id);
    },
    iconPackSelectionChanged(pack) {
      this.$set(this.icon, 'pack', pack);
      this.validate();
    },
    /**
     * Searches for a string in a string and returns an array containing information on how to highlight the matches.
     */
    getHighlightComponents(text, query) {
      const split = text.toLowerCase().split(query);
      const result = [];
      for (let i = 0; i < split.length; i++) {
        result.push({ content: split[i], highlight: false });
        if (i < split.length - 1) {
          result.push({ content: query, highlight: true });
        }
      }
      return result;
    },
    validate() {
      const invalid = this.findIcon(this.icon) === null;
      if (invalid) {
        this.errorMessage = 'Invalid icon';
      } else {
        this.errorMessage = '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/*
Make sure title attribute shows up on icon attached to input.
Bulma disables all pointer events instead of just resetting the cursor.
*/
.icon-preview.button.is-static {
  pointer-events: auto;
  &, &:hover {
    cursor: default;
  }
}

.icon-autocomplete-list.media {
  align-items:center;
}
</style>
