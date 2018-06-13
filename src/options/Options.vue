<template>
  <extension-settings @save="save"></extension-settings>
</template>

<script>
import ExtensionSettings from '@/views/ExtensionSettings';

export default {
  name: 'app',
  components: {
    ExtensionSettings,
  },
  methods: {
    save() {
      browser.runtime.sendMessage({
        from: 'options',
        status: 'saved',
      });
    },
  },
};
</script>

<style lang="scss">
@import "~styles/global-base";
</style>
