export const selectedIcon = {
  type: Object,
  default() {
    return {
      id: '',
      pack: '',
    };
  },
  validator(value) {
    return typeof value.id === 'string' && typeof value.pack === 'string';
  },
};
