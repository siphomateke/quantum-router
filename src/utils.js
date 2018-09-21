import moment from 'moment';

export function memoizeAdvanced(func, keyFunc) {
  const cache = {};
  return (...args) => {
    const key = keyFunc(...args);
    if (cache[key]) {
      return cache[key];
    }

    const val = func(...args);
    cache[key] = val;
    return val;
  };
}


export function memoize(func) {
  return memoizeAdvanced(func, (...args) => JSON.stringify(args));
}

export const momentFormat = memoize((date, format) => moment(date).format(format));
