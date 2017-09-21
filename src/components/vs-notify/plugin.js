let VsNotifyPlugin = {
  install(Vue) {
    let self = this; this.g = {};

    let $notify = function(group, text, type, time) {
      if (self.g[group]) self.g[group](text, type, time);
    };

    Object.defineProperty(Vue.prototype, '$notify', {
      get: function() {
        return $notify;
      },
    });
  },
};

export default VsNotifyPlugin;
