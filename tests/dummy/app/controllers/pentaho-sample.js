import $ from 'jquery';
import Controller from '@ember/controller';
import ReportParameter from '../utils/report-parameter';
import ReportFormat from '../utils/report-output-format';

export default Controller.extend({
  reportName: 'Пример отчета Pentaho',
  locales: undefined,
  reportParameters: undefined,
  reportPath: ':public:Other Project:PentahoSample.prpt',
  doclist: undefined,
  needRefreshReport: false,
  defaultReportFormat:'',

  init() {
    this._super(...arguments);

    this.locales = this.locales || ['ru'];
    this.reportParameters = this.reportParameters || {};
    this.doclist = this.doclist || ['Паспорт РФ', 'Загранпаспорт', 'Снилс', 'Водительское удостоверение', 'Военный билет'];

    this.initReportParameters();
    this.initStartValue();
    this.set('defaultReportFormat', ReportFormat.FullHtml);
  },

  initReportParameters() {
    this.set('reportParameters.Birthday', ReportParameter.create({
      paramName: 'parDate', paramLabel: "День Рождения",
    }));
    this.set('reportParameters.city', ReportParameter.create({
      paramName: 'parDropDown', paramLabel: "Город",
    }));
    this.set('reportParameters.gender', ReportParameter.create({
      paramName: 'parRadioButton', paramLabel: "Пол",
    }));
    this.set('reportParameters.textlogin', ReportParameter.create({
      paramName: 'parText', paramLabel: "Вместо логина",
    }));
    this.set('reportParameters.documentlist', ReportParameter.create({
      paramName: 'parMultiSelect', paramLabel: "Список документов",
    }));
  },

  initStartValue() {
    const currentdate = new Date().toISOString().slice(0, 10);
    this.set('reportParameters.Birthday.value', currentdate);
    this.set('reportParameters.textlogin.value', 'Tony Stark');
    this.set('reportParameters.gender.value', 0);
    this.set('reportParameters.city.value', 0);
  },

  actions: {
    selectGender() {
      this.set('reportParameters.gender.value', this.genderresult);
    },
    selectCity() {
      this.set('reportParameters.city.value', this.selectedCity);
    },
    selectdocs() {
      const favorite = [];
      $.each($("input[name='documentitem']:checked"), function () {
        favorite.push($(this).val());
      });
      /// для передачи нескольких значений в 1 параметр, необходимо дублировать навзание параметра для каждого значения.
      //Пример ...?multi-select=Value1&multi-select=Value2
      const res = favorite.join("&parMultiSelect=");

      this.set('reportParameters.documentlist.value', res);
    },

    printLog(message) {
      console.log(message);
    },
  },
});
