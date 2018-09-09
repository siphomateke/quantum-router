<template>
  <div class="modal-card">
    <header
      v-if="title"
      class="modal-card-head">
      <p class="modal-card-title">{{ title }}</p>
    </header>

    <section
      :class="{ 'is-titleless': !title}"
      class="modal-card-body">
      <div
        :class="{'is-flex': hasIcon, 'has-extra': typeof this.$slots['extra'] !== 'undefined'}"
        class="media">
        <div
          v-if="hasIcon"
          class="media-left">
          <b-icon
            :icon="icon ? icon : iconByType"
            :type="type"
            :both="!icon"
            size="is-large"/>
        </div>
        <div class="media-content">
          <slot/>
        </div>
      </div>
      <slot
        name="extra"
        class="extra"/>
    </section>

    <footer class="modal-card-foot">
      <button
        v-if="canCancel"
        ref="cancelButton"
        class="button"
        @click="cancel">
        {{ cancelText }}
      </button>
      <slot name="buttons"/>
      <button
        ref="confirmButton"
        :class="type"
        class="button"
        @click="confirm">
        {{ confirmText }}
      </button>
    </footer>
  </div>
</template>

<script>
import i18n from '@/platform/i18n';

export default {
  name: 'QDialog',
  props: {
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'is-primary',
    },
    hasIcon: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: () => i18n.getMessage('generic_ok'),
    },
    cancelText: {
      type: String,
      default: () => i18n.getMessage('generic_cancel'),
    },
    canCancel: {
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
  mounted() {
    this.$nextTick(() => {
      this.$refs.confirmButton.focus();
    });
  },
  methods: {
    cancel() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm');
    },
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
