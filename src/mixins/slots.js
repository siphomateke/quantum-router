export default {
  methods: {
    checkSlot(slotName) {
      return typeof this.$slots[slotName] !== 'undefined';
    },
  },
};
