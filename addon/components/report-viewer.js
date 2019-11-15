import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/report-viewer';

/**
 * Компонент для отображения интерфейса отчета.
 * @class report-viewer
 */
export default Ember.Component.extend({
  /**
   * Сервис для работы с локализацией переменных.
   * @property i18n
   * @type Class
   */
  i18n: Ember.inject.service(),
  /**
  * Сервис для работы со всплывающими окнами.
  * @property notifications
  * @type Class
  */
  notifications: Ember.inject.service('notification-messages'),
  /**
   * Сервис для работы с файлом конфигурации.
   * @property config
   * @type Class
   */
  config: Ember.inject.service(),

  layout,
  /**
   * Компонент для работы добавленными CSS-классами.
   * @property classNames
   * @type String[]
   * @default ['ui', 'segment', 'report-segment']
   */
  classNames: ['ui', 'segment', 'report-segment'],

  /**
   * Ссылка на Api для работы с сервисом отчетов.
   * @private
   * @property _reportAPIEndpoint
   * @type String
   * @default null
   */
  _reportAPIEndpoint: null,

  /**
   * Флаг, отображающий загрузку компонента.
   * @private
   * @property _loading
   * @type Boolean
   * @default false
   */
  _loading: false,

  /**
   * Массив с запущенными xhr'ми.
   * @private
   * @property _runningXHRs
   * @type Object[]
   */
  _runningXHRs: undefined,

  /**
   * Наименнование отчета.
   * @property reportName
   * @type String
   */
  reportName: undefined,
  /**
   * Параметры отчета.
   * @property reportParameters
   * @type report-parametr
   */
  reportParameters: undefined,
  /**
   * Относительная ссылка на отчет в системе отчетов.
   * @property reportPath
   * @typeString
   */
  reportPath: undefined,
  /**
   * Текущая страница отчета.
   * @property reportCurrentPage
   * @type Int
   * @default 0
   */
  reportCurrentPage: 0,
  /**
 * Количество страниц в отчете.
 * @property reportPagesCount
 * @type Int
 * @default 0
 */
  reportPagesCount: 0,
  /**
   * Флаг, отображающий недоступность кнопки "Следующая страница отчета".
   * @property isNextButtonDisabled
   * @type Boolean
   * @default true
   */
  isNextButtonDisabled: true,
  /**
   * Флаг, отображающий недоступность кнопки "Предыдущая страница отчета".
   * @property isPrevButtonDisabled
   * @type Boolean
   * @default true
   */
  isPrevButtonDisabled: true,
  /**
   * Массив возможных форматов для вывода отчета.
   * @property pentahoReportFormats
   * @type String[]
   */
  pentahoReportFormats: undefined,
  /**
   * Ширина окна для отображения содержимого отчета.
   * @property frameWidth
   * @type Double
   */
  frameWidth: undefined,
  /**
  * Высота окна для отображения содержимого отчета.
  * @property frameHeight
  * @type Double
  */
  frameHeight: undefined,
  /**
  * Функция, выполняемая перед формированием отчета.
  * @property beforeReportBuildFunction
  * @type Function
  * @default undefined
  */
  beforeReportBuildFunction: undefined,
  /**
  * Функция, выполняемая после формирования отчета.
  * @property afterReportBuildFunction
  * @type Function
  * @default undefined
  */
  afterReportBuildFunction: undefined,
  /**
   * Функция, выполняем при ошибке формарирования отчета.
   * @property onErrorFunction
   * @type Function
   * @default undefined
   */
  onErrorFunction: undefined,
  /**
   * Флаг, отображающий необходимость вызвать построение отчета.
   * @property needRefresh
   * @type Boolean
   * @default false
   */
  needRefresh: false,

  init() {
    this._super();
    const config = this.get('config');
    this.set('_reportAPIEndpoint', config.get('report.reportWebApi'));
    this.set('pentahoReportFormats', {
      pageableHtml: 'table/html;page-mode=page',
      fullHtml: 'table/html;page-mode=stream',
      pdf: 'pageable/pdf',
      csv: 'table/csv;page-mode=stream',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;page-mode=flow',
    });
  },
  /**
   * Метод для получения разметки отчёта из сервиса.
   * @method getReport
   * @param {String} path Относительный ссылка на отчёт в системе отчетов.
   * @param {Object[]} parameters Массив параметров отчета.
   * @param {Function} onDone Функция обратного вызова на случай успеха.
   * @param {Function} onFail Функция обратного вызова на случай ошибки.
   * @returns {Object} Разметка отчета.
   */
  getReport(path, parameters, onDone, onFail) {
    Object.assign(parameters, { reportPath: path });
    return this._sendPostRequest(`${this.get('_reportAPIEndpoint')}getReport/`, parameters, 'json', onDone, onFail);
  },
  /**
   * Метод для получения количества страниц из системы отчетов.
   * @method getReportPagesCount
   * @param {String} path Относительный ссылка на отчёт в системе отчетов.
   * @param {Object[]} parameters Массив параметров отчета.
   * @param {Function} onDone Функция обратного вызова на случай успеха.
   * @param {Function} onFail Функция обратного вызова на случай ошибки.
   * @returns {Object} Количество страниц отчета.
   */
  getReportPagesCount(path, parameters, onDone, onFail) {
    Object.assign(parameters, { reportPath: path });
    return this._sendPostRequest(`${this.get('_reportAPIEndpoint')}getPageCount/`, parameters, '', onDone, onFail);
  },
  /**
   * Метод для получения файл для экспорта из системы отчетов.
   * @method getExportReportData
   * @param {String} path Относительный ссылка на отчёт в системе отчетов.
   * @param {Object[]} parameters Массив параметров отчета.
   * @param {Function} onDone Функция обратного вызова на случай успеха.
   * @param {Function} onFail Функция обратного вызова на случай ошибки.
   * @returns {Object} Бинарный файл для экспорта.
   */
  getExportReportData(path, parameters, onDone, onFail) {
    Object.assign(parameters, { reportPath: path });
    return this._sendPostRequest(`${this.get('_reportAPIEndpoint')}export/`, parameters, 'blob', onDone, onFail);
  },

  /**
  * Обсервер на число максимального кол-ва страниц в отчете,
  * ибо оно формируется не мгновенно
  * @method reportPagesCountObservation
  */
  reportPagesCountObservation: Ember.observer('reportPagesCount', function () {
    if (this.get('reportCurrentPage') !== this.get('reportPagesCount')) {
      this.set('isNextButtonDisabled', false);
    }
  }),

  /**
   * Слушаеть измененией флага на необходимост перестроить очтет.
   * @method reportRefreshObservation
   */
  reportRefreshObservation: Ember.observer('needRefresh', function () {
    if (this.get('needRefresh') === true) {
      this.send('buildReport');
      this.set('needRefresh', false);
    }
  }),

  /**
   *  Отображает отчёт в поле для отчёта.
   * @method showReport
   * @param {String} reportHtml HTML-разметка отчёта.
   */
  showReport(reportHtml) {
    const $contentIframe = this.$('#content');

    $contentIframe.contents().find('body').html(reportHtml);
    this.set("frameHeight", `${$contentIframe.contents().find('body').prop('scrollHeight')}px`);
    this.set("frameWidth", `${$contentIframe.contents().find('body').prop('scrollWidth')}px`);
  },

  /**
   *  Единая точка входа для отправки POST-запроса.
   * @method _sendPostRequest
   * @param {String} uri URI для отправки.
   * @param {Object} parameters Тело запроса.
   * @param {String} dataType Тип возвращаемых данных.
   * @param {Function} onDone Функция обратного вызова на случай успеха.
   * @param {Function} onFail Функция обратного вызова на случай ошибки.
   */
  _sendPostRequest(uri, parameters, dataType, onSuccess, onError) {
    const _this = this;

    onSuccess = onSuccess || function (data) { return data; };

    onError = onError || function (e) {
      _this._loading = false;
      if (e.statusText !== 'abort') {
        console.log(e);
      }
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = dataType;
    xhr.withCredentials = true;

    xhr.onload = function () {
      if (this.status === 200) {
        onSuccess(this.response);
      }
    };

    xhr.onerror = function (e) {
      onError(e);
    };

    xhr.send(JSON.stringify(parameters));
  },

  /**
   *  Загружает файл на компьютер.
   * @method _downloadFile
   * @param {String} fileContent Контент.
   * @param {String} fileName Имя файла.
   * @param {String} fileType Тип файла.
   */
  _downloadFile(fileContent, fileName, fileType) {
    // (см. https://stackoverflow.com/a/23797348)
    const blob = typeof File === 'function' ?
      new File([fileContent], fileName, { type: fileType })
      : new Blob([fileContent], { type: fileType, lastModified: Date.now });

    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      const URL = window.URL || window.webkitURL;
      const downloadUrl = URL.createObjectURL(blob);

      if (fileName) {
        // use HTML5 a[download] attribute to specify filename
        const a = document.createElement('a');

        // safari doesn't support this yet
        if (typeof a.download === 'undefined') {
          window.location = downloadUrl;
        } else {
          a.href = downloadUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
        }
      } else {
        window.location = downloadUrl;
      }

      setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
    }
  },

  /**
   * Возвращает параметры отчёта в нормализованном виде.
   * @method _getNormalizedParameters
   * @param {Object} parameters Параметры отчёта.
   * @returns {Object} Преобразованные значения параметра в JSON объекты.
   */
  _getNormalizedParameters(parameters) {
    const normalizedParameters = Ember.copy(parameters);

    Object.keys(normalizedParameters).forEach(key => {
      normalizedParameters[key].set('value', this._tryParseJSON(normalizedParameters[key].get('value')) || normalizedParameters[key].get('value'));

      if (normalizedParameters[key].get('value') instanceof Date) {
        const value = normalizedParameters[key].get('value');
        normalizedParameters[key].set('value', moment(value).format('YYYY-MM-DD'));
      }
    });

    return normalizedParameters;
  },

  /**
   * Преобразует строку в JSON объект.
   * @method _tryParseJSON
   * @param {String} string
   * @returns {Object} В случае успешного преобразования строки возвращает JSON объект, иначе NULL.
   */
  _tryParseJSON(string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      return null;
    }
  },

  /**
   * Отмена выполняемого запроса.
   * @method _abortRunningXHRs
   */
  _abortRunningXHRs() {
    const runningXHRs = this.get('_runningXHRs') || [];
    if (runningXHRs.length) {
      let xhr = runningXHRs.pop();
      while (xhr) {
        xhr.abort();
        xhr = runningXHRs.pop();
      }
    }
  },

  /**
   * Проверка и выполнение функции.
   * @method _callFunctionIfDefine
   * @param {Function} func Вызываемая функция.
   */
  _callFunctionIfDefine(func) {
    if (func) {
      if ((func instanceof Function)) {
        func();
      }
    }
  },

  actions: {
    /**
     * Обработчик построения отчета.
     *@method actions.buildReport
     */
    buildReport() {
      try {
        this.set('_loading', true);
        this._callFunctionIfDefine(this.beforeReportBuildFunction);
        const runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        runningXHRs.push(this.getReport(this.get('reportPath'), this._getNormalizedParameters(this.get('reportParameters')), reportData => {
          this.set('_loading', false);
          this.showReport(reportData);
        }));

        runningXHRs.push(this.getReportPagesCount(this.get('reportPath'), this._getNormalizedParameters(this.get('reportParameters')), data => {
          this.set('reportPagesCount', parseInt(data));
        }));

        this.set('reportCurrentPage', 1);

        this.set('_runningXHRs', runningXHRs);
      } catch (e) {
        this.set('_loading', false);
        Ember.Logger.log(this.get('i18n').t('ember-flexberry-analytics.error-on-report-build'), e);

        this.get('notifications').error(this.get('i18n').t('ember-flexberry-analytics.error-on-report-build-notification'), {
          autoClear: true,
          clearDuration: 7000
        });

        this._callFunctionIfDefine(this.onErrorFunction);
      }

      this._callFunctionIfDefine(this.afterReportBuildFunction);
    },

    /**
     * Обработчик экшена - экспорт отчета.
     * @method actions.exportReport
     * @param {String} exportFormat формат экспортируемого документа.
     */
    exportReport(exportFormat) {
      try {
        let fileType = '';
        let pentahoFormat = '';

        switch (exportFormat) {
          case 'pdf':
            fileType = 'application/pdf';
            pentahoFormat = this.get('pentahoReportFormats.pdf');
            break;
          case 'xlsx':
            fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            pentahoFormat = this.get('pentahoReportFormats.xlsx');
            break;
          case 'csv':
            fileType = 'text/csv';
            pentahoFormat = this.get('pentahoReportFormats.csv');
            break;
        }

        this.set('_loading', true);

        const runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        const parameters = Object.assign(
          {},
          this._getNormalizedParameters(this.get('reportParameters')),
          {
            'output-target': pentahoFormat,
            reportName: this.get('reportName')
          }
        );

        runningXHRs.push(this.getExportReportData(this.get('reportPath'), parameters, (fileData) => {
          this.set('_loading', false);
          this._downloadFile(
            fileData,
            `${this.get('reportName')} на ${moment().format('YYYY-MM-DD')}.${exportFormat}`,
            fileType);
        }));

        this.set('_runningXHRs', runningXHRs);
      } catch (e) {
        this.set('_loading', false);
        Ember.Logger.log(this.get('i18n').t('ember-flexberry-analytics.error-on-report-export'), e);

        this.get('notifications').error(this.get('i18n').t('ember-flexberry-analytics.error-on-report-export-notification'), {
          autoClear: true,
          clearDuration: 7000
        });

        this._callFunctionIfDefine(this.onErrorFunction);
      }
    },

    /**
     * Обработчик экшена - печать отчета.
     * @method actions.printReport
     */
    printReport() {
      try {
        this.set('_loading', true);

        const runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        runningXHRs.push(this.getReport(this.get('reportPath'), this._getNormalizedParameters(this.get('reportParameters')), reportData => {
          this.set('_loading', false);

          const printWindow = window.open('', 'PRINT', 'height=400,width=600');
          printWindow.document.write(reportData);
          printWindow.print();
          printWindow.close();
        }));

        this.set('_runningXHRs', runningXHRs);
      } catch (e) {
        this.set('_loading', false);
        Ember.Logger.log(this.get('i18n').t('ember-flexberry-analytics.error-on-report-print'), e);

        this.get('notifications').error(this.get('i18n').t('ember-flexberry-analytics.error-on-report-print-notification'), {
          autoClear: true,
          clearDuration: 7000
        });

        this._callFunctionIfDefine(this.onErrorFunction);
      }
    },

    /**
     * Обработчик экшена - переход на следующую страницу.
     * @method actions.getNextPage
     */
    getNextPage() {
      if (this.get('reportCurrentPage') + 1 <= this.get('reportPagesCount')) {

        const runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        const parameters = Object.assign(
          {},
          this._getNormalizedParameters(this.get('reportParameters')),
          { 'accepted-page': this.get('reportCurrentPage') });
        this.incrementProperty('reportCurrentPage');

        runningXHRs.push(this.getReport(this.get('reportPath'), parameters, reportData => {
          this.showReport(reportData);
        }));

        this.set('_runningXHRs', runningXHRs);
      }

      this.set("isPrevButtonDisabled", false);
      if (this.get('reportCurrentPage') === this.get('reportPagesCount')) {
        this.set("isNextButtonDisabled", true);
      }
    },

    /**
     * Обработчик экшена - переход на следующую страницу.
     * @method actions.getPrevPage
     */
    getPrevPage() {
      if (this.get('reportCurrentPage') > 1) {

        const runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        this.decrementProperty('reportCurrentPage');
        const parameters = Object.assign(
          {},
          this._getNormalizedParameters(this.get('reportParameters')),
          { 'accepted-page': this.get('reportCurrentPage') - 1 });

        runningXHRs.push(this.getReport(this.get('reportPath'), parameters, reportData => {
          this.showReport(reportData);
        }));

        this.set('_runningXHRs', runningXHRs);
      }

      this.set("isNextButtonDisabled", false);
      if (this.get('reportCurrentPage') === 1) {
        this.set("isPrevButtonDisabled", true);
      }
    },

    /**
     * Обработчик экшена - Прерывание обработки отчета.
     * @method actions.abortRequest
     */
    abortRequest() {
      this._abortRunningXHRs();
      this.set('_loading', false);

      this.get('notifications').info(this.get('i18n').t('ember-flexberry-analytics.cancel-report-build'), {
        autoClear: true,
        clearDuration: 7000,
        cssClasses: 'ember-cli-notification-info'
      });
    }
  }
});
