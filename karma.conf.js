// Karma configuration
// Generated on Tue Oct 01 2013 20:57:07 GMT+0300 (FLE Daylight Time)
'use strict';
module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'public/lib/jquery/jquery-2.1.0.min.js',
      'public/lib/angular/angular.js',
      'public/lib/angular/angular-resource.js',
      'public/lib/angular/angular-route.js',
      'public/lib/angular/angular-sanitize.min.js',
      'public/lib/angular/angular-animate.min.js',
      'public/lib/angular/angular-mocks.js',
      'public/lib/angular/modules/angular-moment.min.js',
      'public/lib/angular/modules/select2.js',
      'public/lib/angular/modules/loading-bar.min.js',
      'public/js/collabjs.js',
      'public/js/app.js',
      'public/js/services/*Service.js',
      'public/js/controllers/*Controller.js',
      'public/js/filters/*.js',
      'public/js/directives/*.js',
      'test/client/*/*Spec.js'
    ],

    // list of files to exclude
    exclude: [
      
    ],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'public/js/app.js': 'coverage',
      'public/js/controllers/*Controller.js': 'coverage',
      'public/js/services/*Service.js': 'coverage',
      'public/js/directives/*.js': 'coverage',
      'public/js/filters/*.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
