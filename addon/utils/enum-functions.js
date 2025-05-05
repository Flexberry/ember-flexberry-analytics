import { merge } from '@ember/polyfills';
import { isArray } from '@ember/array';

export function Enumeration(dictionary) {
  let local = {};
  if (isArray(dictionary)) {
    dictionary.forEach((element) => { local[element] = element });
  } else {
    local = dictionary;
  }

  return Object.freeze(merge(Object.create(null), local));
}
