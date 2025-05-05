import { schedule } from '@ember/runloop';
import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    didTransition: function () {
      schedule('afterRender', () => {
        this.controller.set('needRefreshReport', true);
      });
      return true;
    },
  },
});
