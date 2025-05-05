import EmberObject from '@ember/object';

/**
 * Класс для работы с параметрами отчета.
 * @class report-parametr
 */
export default EmberObject.extend({
  /**
   * Имя параметра (соответствует названию параметра в отчёте).
   * @property paramName
   * @type String
   */
  paramName: '',

  /**
   * Метка параметра (соответствует названию параметра на форме).
   * @property paramLabel
   * @type String
   */
  paramLabel: '',

  /**
   * Значение параметра.
   * @property value
   * @type String
   */
  value: null,
});