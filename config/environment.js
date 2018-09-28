/* eslint-env node */
'use strict';

module.exports = function(environment) {
  var ENV = {
        APP: {
          reportUrl:'repurl'
    },

    report:{
      reportWebApi: 'http://localhost:3564',
      extention :'.prpt'
    }
  };

 return ENV;
};

