/* eslint-env node */
'use strict';

module.exports = function(environment) {
  var ENV = {
    report:{
      reportWebApi: 'http://localhost:3564/reportapi/Report/',
      extention :'.prpt'
    }
  };

 return ENV;
};

