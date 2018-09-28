import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * Имя параметра (соответствует названию параметра в отчёте).
   */
  paramName: '',

  /**
   * Метка параметра (соответствует названию параметра на форме).
   */
  paramLabel: '',

  /**
   * Значение параметра.
   */
  value: null
});