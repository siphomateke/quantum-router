<template>
<div class="page-content">
  <div class="box">
    <section class="section">
      <div class="content">
        Received/Sent: {{ received }} / {{ sent }}
      </div>
    </section>
  </div>
</div>
</template>

<script>
import {RouterController} from '@/chrome/router.js';
export default {
  name: 'Home',
  data() {
    return {
      received: 0,
      sent: 0,
    };
  },
  mounted() {
    this.bus.$on('refresh', () => {
      RouterController.getTrafficStatistics().then((data) => {
        this.received = data.CurrentDownload;
        this.sent = data.CurrentUpload;
      });
    });
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
