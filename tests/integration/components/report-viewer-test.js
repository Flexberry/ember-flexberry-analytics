import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | report viewer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    assert.expect(6);
    await render(hbs`{{report-viewer}}`);

    assert.ok(this.$().find('build-report'),"create button not exist");
    assert.ok(this.$().find('print-report'),"print button not exist");
    assert.ok(this.$().find('prev-page-button'),"prev button not exist");
    assert.ok(this.$().find('next-page-button'),"next button not exist");
    assert.ok(this.$().find('export-button'),"export button not exist");
    assert.equal(findAll(".export-button").length,3,"not all export button exist");
  });
});