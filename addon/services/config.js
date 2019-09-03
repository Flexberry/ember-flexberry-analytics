import Ember from 'ember';

const {
    Service,
    computed,
    get
  } = Ember;
  
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
      return Ember.getOwner(this)._lookupFactory('config:environment');
    }),
  
    /**
     * Получает значение параметра из файла конфигурации.
     * @method unknownProperty
     * @param {String} path Путь до параметра.
     * @returns {Object} Значение выбранного параметра.
     */
    unknownProperty(path) {
      return get(this, `_config.${path}`);
    }
  });