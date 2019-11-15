import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didTransition: function () {
      Ember.run.schedule('afterRender', () => {
        this.get('controller').set('needRefreshReport', true);
      });
      return true;
    }
  }
});
