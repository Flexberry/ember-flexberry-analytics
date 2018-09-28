import Ember from 'ember';

const {
    Service,
    computed,
    get
  } = Ember;
  
  /**
    Сервис-обертка для получения настрок из config:environment.
  */
  export default Service.extend({
    __config__: computed(function() {
      return Ember.getOwner(this)._lookupFactory('config:environment');
      //return Ember.getOwner(this).resolveRegistration('config:environment');
    }),
  
    unknownProperty(path) {
      return get(this, `__config__.${path}`);
    }
  });