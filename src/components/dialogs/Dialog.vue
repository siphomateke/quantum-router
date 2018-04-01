<template>
<div class="modal-card">
  <header class="modal-card-head" v-if="title">
    <p class="modal-card-title">{{ title }}</p>
  </header>

  <section
    class="modal-card-body"
    :class="{ 'is-titleless': !title}">
    <div class="media" :class="{'is-flex': hasIcon, 'has-extra': typeof this.$slots['extra'] !== 'undefined'}">
      <div class="media-left" v-if="hasIcon">
        <b-icon
          :icon="icon ? icon : iconByType"
          :type="type"
          :both="!icon"
          size="is-large"/>
      </div>
      <div class="media-content">
        <slot></slot>
      </div>
    </div>
    <slot name="extra" class="extra"></slot>
  </section>

  <footer class="modal-card-foot">
    <button
      v-if="canCancel"
      class="button"
      ref="cancelButton"
      @click="cancel">
      {{ cancelText }}
    </button>
    <slot name="buttons"></slot>
    <button
      class="button"
      :class="type"
      ref="confirmButton"
      @click="confirm">
      {{ confirmText }}
    </button>
  </footer>
</div>
</template>

<script>
import i18n from '@/browser/i18n.js';

export default {
  name: 'q-dialog',
  props: {
    'title': String,
    'type': {
      type: String,
      default: 'is-primary',
    },
    'hasIcon': Boolean,
    'icon': String,
    'confirmText': {
      type: String,
      default: () => {
        return i18n.getMessage('generic_ok');
      },
    },
    'cancelText': {
      type: String,
      default: () => {
        return i18n.getMessage('generic_cancel');
      },
    },
    'canCancel': {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    iconByType() {
      switch (this.type) {
      case 'is-info':
        return 'information';
      case 'is-success':
        return 'check-circle';
      case 'is-warning':
        return 'alert';
      case 'is-danger':
        return 'alert-circle';
      default:
        return null;
      }
    },
  },
  methods: {
    cancel() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm');
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.confirmButton.focus();
    });
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';

  .modal-card {
    .modal-card-head {
      font-size: $size-5;
      font-weight: $weight-semibold;
    }
    .modal-card-body {
      .field {
        margin-top: 16px;
      }
      &.is-titleless {
        border-top-left-radius: $radius-large;
        border-top-right-radius: $radius-large;
      }
      .media.has-extra {
        margin-bottom: 1em;
      }
    }
    .modal-card-foot {
      justify-content: flex-end;
      .button {
        display: inline; // Fix Safari centering
        min-width: 5em;
        font-weight: $weight-semibold;
      }
    }
  }
</style>
