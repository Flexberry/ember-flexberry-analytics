import { getOwner } from '@ember/application';
import Service from '@ember/service';
import { get, computed } from '@ember/object';

/**
  Сервис-обертка для получения настрок из config:environment.
  @class config
*/
export default Service.extend({
  /**
   * Файл конфигурации.
   * @property config
   * @type Object
   */
  _config: computed(function() {
    return getOwner(this).factoryFor('config:environment').class;
  }),

  /**
   * Получает значение параметра из файла конфигурации.
   * @method unknownProperty
   * @param {String} path Путь до параметра.
   * @returns {Object} Значение выбранного параметра.
   */
  unknownProperty(path) {
    return get(this, `_config.${path}`);
  },
});