import Ember from 'ember';

export function Enumeration(dictionary) {
  let local = {};
  if (Ember.isArray(dictionary)) {
    dictionary.forEach(element => local[element] = element);
  } else {
    local = dictionary;
  }

  return Object.freeze(Ember.merge(Object.create(null), local));
}
