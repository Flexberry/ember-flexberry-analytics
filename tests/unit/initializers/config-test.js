import Ember from 'ember';
import ConfigInitializer from 'dummy/initializers/config';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | config', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  ConfigInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
