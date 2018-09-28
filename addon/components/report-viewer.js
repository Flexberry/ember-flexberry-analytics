import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/report-viewer';
import ReportParameter from '../utils/report-parameter';

export default Ember.Component.extend({
  //notifications: Ember.inject.service('notification-messages-service'),
  notifications: Ember.inject.service('notification-messages'),
  config: Ember.inject.service(),

  layout,

  classNames: ['ui', 'segment', 'report-segment'],

  _reportAPIEndpoint: null,

  /**
   * Флаг, отображающий загрузку компонента.
   */
  _loading: false,

  /**
   * Массив с запущенными xhr'ми.
   */
  _runningXHRs: undefined,

  reportName: '',
  reportParameters: {},

  reportCurrentPage: 0,
  reportPagesCount: 0,
  
  // Путь к отчету в pentaho
  reportPath: undefined,
  

  pentahoReportFormats: {
    pageableHtml: 'table/html;page-mode=page',
    fullHtml: 'table/html;page-mode=stream',
    pdf: 'pageable/pdf',
    csv: 'table/csv;page-mode=stream',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;page-mode=flow',
  },

  init() {
    this._super();
    let config = this.get('config');
 
  },

  getReport(path, parameters, onDone, onFail) {
    Object.assign(parameters, { reportPath: path });
    return this._sendPostRequest(`${this.get('_reportAPIEndpoint')}getReport/`, parameters, '', onDone, onFail);
  },

  getReportPagesCount(path, parameters, onDone, onFail) {
    Object.assign(parameters, { reportPath: path });
    return this._sendPostRequest(`${this.get('_reportAPIEndpoint')}getPageCount/`, parameters, '', onDone, onFail);
  },

  getExportReportData(path, parameters, onDone, onFail) {
    Object.assign(parameters, { reportPath: path });
    return this._sendPostRequest(`${this.get('_reportAPIEndpoint')}export/`, parameters, 'arraybuffer', onDone, onFail);
  },

  /**
  * Обсервер на число максимального кол-ва страниц в отчете,
  * ибо оно формируется не мгновенно
  */
  reportPagesCountObservation: Ember.observer('reportPagesCount', function() {
    if (this.get('reportCurrentPage') !== this.get('reportPagesCount')) {
      Ember.$('.report-viewer').find('.next-page-button').removeClass('disabled');
    }
  }),

  /**
   *  Отображает отчёт в поле для отчёта.
   * @param {String} reportHtml html-разметка отчёта.
   */
  showReport(reportHtml) {
    let $contentIframe = Ember.$('#content');

    $contentIframe.contents().find('body').html(reportHtml);
    $contentIframe.height(`${$contentIframe.contents().find('body').prop('scrollHeight')}px`);
    $contentIframe.width(`${$contentIframe.contents().find('body').prop('scrollWidth')}px`);
  },

  /**
   *  Единая точка входа для отправки POST-запроса.
   * @param {String} uri URI для отправки.
   * @param {Object} parameters Тело запроса.
   * @param {String} dataType Тип возвращаемых данных.
   * @param {Function} onDone Функция обратного вызова на случай успеха.
   * @param {Function} onFail Функция обратного вызова на случай ошибки.
   */
  _sendPostRequest(uri, parameters, dataType, onDone, onFail) {
    let _this = this;

    onDone = onDone || function(data) { return data; };

    onFail = onFail || function(e) {
      _this.set('_loading', false);
      if (e.statusText !== 'abort') {
        Ember.Logger.error(e);
        // _this.get('notifications').error('Ошибка построения отчёта. Обратитесь к администратору', {
        //   autoClear: true,
        //   clearDuration: 7000
        // });
      }
    };

    return Ember.$.ajax({
      method: 'POST',
      url: uri,
      data: JSON.stringify(parameters),
      dataType: dataType,
      contentType: 'application/json; charset=utf-8',
    }).done(data => onDone(data))
      .fail(e => onFail(e));
  },

  /**
   *  Загружает файл на компьютер.
   * @param {String} fileContent Контент.
   * @param {String} fileName Имя файла.
   * @param {String} fileType Тип файла.
   */
  _downloadFile(fileContent, fileName, fileType) {
    // (см. https://stackoverflow.com/a/23797348)
    let blob = typeof File === 'function' ?
      new File([fileContent], fileName, { type: fileType })
      : new Blob([fileContent], { type: fileType, lastModified: Date.now });

    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      var URL = window.URL || window.webkitURL;
      var downloadUrl = URL.createObjectURL(blob);

      if (fileName) {
        // use HTML5 a[download] attribute to specify filename
        var a = document.createElement('a');

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
   *  Возвращает параметры отчёта в нормализованном виде.
   * @param {Object} parameters Параметры отчёта.
   */
  _getNormalizedParameters(parameters) {
    let normalizedParameters = Ember.copy(parameters);

    Object.keys(normalizedParameters).forEach(key => {
      normalizedParameters[key].set('value', this._tryParseJSON(normalizedParameters[key].get('value')) || normalizedParameters[key].get('value'));

      if (normalizedParameters[key].get('value') instanceof Date) {
        let value = normalizedParameters[key].get('value');
        normalizedParameters[key].set('value', moment(value).format('YYYY-MM-DD'));
      }
    });

    return normalizedParameters;
  },

  _tryParseJSON(string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      return null;
    }
  },

  /**
   * Отменить выполняемые запросы.
   */
  _abortRunningXHRs() {
    let runningXHRs = this.get('_runningXHRs') || [];
    if (runningXHRs.length) {
      let xhr = runningXHRs.pop();
      while (xhr) {
        xhr.abort();
        xhr = runningXHRs.pop();
      }
    }
  },

  actions: {
    buildReport() {
      try {
        this.set('_loading', true);

        let runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        runningXHRs.push(this.getReport(this.get('reportPath'), this._getNormalizedParameters(this.get('reportParameters')), reportData => {
          this.set('_loading', false);
          this.showReport(reportData);
        }));

        runningXHRs.push(this.getReportPagesCount(this.get('reportPath'), this._getNormalizedParameters(this.get('reportParameters')), data => {
          this.set('reportPagesCount', data);
        }));

        this.set('reportCurrentPage', 1);

        this.set('_runningXHRs', runningXHRs);
      } catch (e) {
        this.set('_loading', false);
        Ember.Logger.log('Ошибка построения отчёта.', e);

        // this.get('notifications').error('Ошибка построения отчёта. Обратитесь к администратору', {
        //   autoClear: true,
        //   clearDuration: 7000
        // });
      }
    },

    /**
     * Обработчик экшена - экспорт отчета.
     *
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

        let runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        let parameters = Object.assign(
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
        Ember.Logger.log('Ошибка при экспорте отчёта.', e);

        // this.get('notifications').error('Ошибка при экспорте отчёта. Обратитесь к администратору', {
        //   autoClear: true,
        //   clearDuration: 7000
        // });
      }
    },

    printReport() {
      try {
        this.set('_loading', true);

        let runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        runningXHRs.push(this.getReport(this.get('reportPath'), this._getNormalizedParameters(this.get('reportParameters')), reportData => {
          this.set('_loading', false);

          let printWindow = window.open('', 'PRINT', 'height=400,width=600');
          printWindow.document.write(reportData);
          printWindow.print();
          printWindow.close();
        }));

        this.set('_runningXHRs', runningXHRs);

      } catch (e) {
        this.set('_loading', false);
        Ember.Logger.log('Ошибка при печати отчёта.', e);

        // this.get('notifications').error('Ошибка при печати отчёта. Обратитесь к администратору', {
        //   autoClear: true,
        //   clearDuration: 7000
        // });
      }
    },

    getNextPage() {
      if (this.get('reportCurrentPage') + 1 <= this.get('reportPagesCount')) {

        let runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        let parameters = Object.assign(
          {},
          this._getNormalizedParameters(this.get('reportParameters')),
          { 'accepted-page': this.get('reportCurrentPage') });
        this.incrementProperty('reportCurrentPage');

        runningXHRs.push(this.getReport(this.get('reportPath'), parameters, reportData => {
          this.showReport(reportData);
        }));

        this.set('_runningXHRs', runningXHRs);
      }

      Ember.$('.report-viewer').find('.prev-page-button').removeClass('disabled');
      if (this.get('reportCurrentPage') === this.get('reportPagesCount')) {
        Ember.$('.report-viewer').find('.next-page-button').addClass('disabled');
      }
    },

    getPrevPage() {
      if (this.get('reportCurrentPage') > 1) {

        let runningXHRs = this.get('_runningXHRs') || [];
        this._abortRunningXHRs();

        this.decrementProperty('reportCurrentPage');
        let parameters = Object.assign(
          {},
          this._getNormalizedParameters(this.get('reportParameters')),
          { 'accepted-page': this.get('reportCurrentPage') - 1 });

        runningXHRs.push(this.getReport(this.get('reportPath'), parameters, reportData => {
          this.showReport(reportData);
        }));

        this.set('_runningXHRs', runningXHRs);
      }

      Ember.$('.report-viewer').find('.next-page-button').removeClass('disabled');
      if (this.get('reportCurrentPage') === 1) {
        Ember.$('.report-viewer').find('.prev-page-button').addClass('disabled');
      }
    },

    abortRequest() {
      this._abortRunningXHRs();
      this.set('_loading', false);

      // this.get('notifications').info('Формирование отчёта отменено', {
      //   autoClear: true,
      //   clearDuration: 7000,
      //   cssClasses: 'ember-cli-notification-info'
      // });
    }
  }
});
