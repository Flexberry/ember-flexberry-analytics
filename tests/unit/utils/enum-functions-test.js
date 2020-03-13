import enumFunctions from 'dummy/utils/enum-functions';
import { module, test } from 'qunit';

module('Unit | Utility | enum functions');

// Replace this with your real tests.
test('it works', function(assert) {
  const value = 'testvalue';
  let result = enumFunctions.Enumeration({item:value});

  assert.equal(result.item, value,'should be value "testvalue"');
});
