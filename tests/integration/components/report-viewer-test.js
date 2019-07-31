import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('report-viewer', 'Integration | Component | report viewer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  assert.expect(6);
  this.render(hbs`{{report-viewer}}`);

  assert.ok(this.$().find('build-report'),"create button not exist");
  assert.ok(this.$().find('print-report'),"print button not exist");
  assert.ok(this.$().find('prev-page-button'),"prev button not exist");
  assert.ok(this.$().find('next-page-button'),"next button not exist");
  assert.ok(this.$().find('export-button'),"export button not exist");
  assert.equal(this.$(".export-button").length,3,"not all export button exist");
});