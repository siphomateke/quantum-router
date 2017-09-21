<template>
  <div :class="['vs-notify', group]" :style="styles">
    <transition-group :name="trans" mode="out-in">
      <div :class="it.type" v-for="it in list" :key="it.id">
        <slot name="body" :class="it.type" :item="it" :close="function(){ end(it) }">
        <div @click.stop="end(it)" v-html="it.text"></div>
      </slot>
      </div>
    </transition-group>
  </div>
</template>

<script>
import VsNotifyPlugin from './index.js';
export default {
  name: 'vs-notify',
  props:
    {
      group: String, transition: String,
      position: {type: String, default: 'top right'},
      duration: {type: Number, default: 3000},
      reverse: {type: Boolean, default: false},
    },

  data: function() {
    let d = !this.reverse, p = this.position, t = this.transition;

    if (p.indexOf('bottom') + 1) d = !d;

    if (!t && p.indexOf('left') + 1) t = 'ntf-left';
    if (!t && p.indexOf('right') + 1) t = 'ntf-right';

    return {dir: d, trans: t, list: []};
  },

  created: function() {
    let ids = 1, self = this;

    VsNotifyPlugin.g[this.group] = function(text, type, time) {
      if (text === undefined) {
        self.end(); return;
      }

      let it = {id: ids++, text: text, type: type ? type : ''};

      time = (time !== undefined ? time : self.duration);

      if (time > 0) {
        it.timer = setTimeout(function() {
          self.end(it);
        }, time);
      }

      self.dir ? self.list.push(it) : self.list.unshift(it);
    };
  },

  // destroyed: function(){ }, // do we need it? if so - remove group from VsNotify

  computed: {
    styles: function() {
      let s = {}, pa = this.position.split(' ');

      for (let i = 0; i < pa.length; i++) {
        if (pa[i] == 'center') {
          s.left = s.right = 0; s.margin = 'auto';
        } else if (pa[i] != '') s[pa[i]] = 0;
      }

      return s;
    },
  },

  methods: {
    find: function(id) {
      for (let i = 0; i < this.list.length; i++) if (this.list[i].id == id) return i; return -1;
    },

    end_no: function(n) {
      if (n + 1) {
        clearTimeout(this.list[n].timer); this.list.splice(n, 1);
      }
    },

    end: function(it) {
      if (it === undefined) {
        while (this.list.length) this.end_no(0); return;
      } // kill all

      this.end_no(this.find(it.id));
    },
  },
};
</script>

<style lang="scss" scoped>

.vs-notify {
  position: fixed;
  z-index: 9999;
}

.ntf-left-enter-active,
.ntf-left-leave-active,
.ntf-right-enter-active,
.ntf-right-leave-active,
.ntf-top-enter-active,
.ntf-top-leave-active,
.ntf-bottom-enter-active,
.ntf-bottom-leave-active {
  transition: all 0.3s;
}

.ntf-left-enter,
.ntf-left-leave-to {
  opacity: 0;
  transform: translateX(-300px);
}

.ntf-right-enter,
.ntf-right-leave-to {
  opacity: 0;
  transform: translateX(300px);
}

.ntf-fade-enter-active,
.ntf-fade-leave-active {
  transition: opacity 0.5s;
}

.ntf-fade-enter,
.ntf-fade-leave-to {
  opacity: 0;
}

.ntf-top-enter,
.ntf-top-leave-to {
  opacity: 0;
  transform: translateY(-120px);
}

.ntf-bottom-enter,
.ntf-bottom-leave-to {
  opacity: 0;
  transform: translateY(120px);
}

</style>
