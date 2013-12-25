module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cssmin: {
      options: {
        banner: '/*!\n' +
                '* <%= pkg.name %> v<%= pkg.version %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                '* License: MIT\n' +
                '* http://www.opensource.org/licenses/mit-license.php\n' +
                '*/\n'
      },
      css: {
        src: 'public/css/collabjs.css',
        dest: 'public/css/collabjs.min.css'
      }
    },
    concat: {
      options: {
        banner: '/*!\n' +
          '* <%= pkg.name %> v<%= pkg.version %>\n' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
          '* License: MIT\n' +
          '* http://www.opensource.org/licenses/mit-license.php\n' +
          '*/\n'
      },
      "js-services": {
        src: 'public/js/services/*Service.js',
        dest: 'public/js/services.js'
      },
      "js-directives": {
        src: 'public/js/directives/*.js',
        dest: 'public/js/directives.js'
      },
      "js-filters": {
        src: 'public/js/filters/*.js',
        dest: 'public/js/filters.js'
      },
      "js-controllers" : {
        src: 'public/js/controllers/*Controller.js',
        dest: 'public/js/controllers.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        banner: '/*!\n' +
          '* <%= pkg.name %> v<%= pkg.version %>\n' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
          '* License: MIT\n' +
          '* http://www.opensource.org/licenses/mit-license.php\n' +
          '*/\n'
      },
      "js-main": {
        src: 'public/js/collabjs.js',
        dest: 'public/js/collabjs.min.js'
      },
      "js-services": {
        src: 'public/js/services.js',
        dest: 'public/js/services.min.js'
      },
      "js-directives": {
        src: 'public/js/directives.js',
        dest: 'public/js/directives.min.js'
      },
      "js-filters": {
        src: 'public/js/filters.js',
        dest: 'public/js/filters.min.js'
      },
      "js-controllers": {
        src: 'public/js/controllers.js',
        dest: 'public/js/controllers.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'concat', 'uglify']);
};