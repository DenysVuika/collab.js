module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cssmin: {
      options: {
        banner: '/*!\n' +
                '* <%= pkg.name %> v<%= pkg.version %>\n' +
                '* Copyright (c) 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
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
                '* Copyright (c) 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                '* License: MIT\n' +
                '* http://www.opensource.org/licenses/mit-license.php\n' +
                '*/\n'
      },
      "js-core" : {
        src: [
          'public/js/collabjs.js',
          'public/js/app.js',
          'public/js/services/*Service.js',
          'public/js/directives/*.js',
          'public/js/filters/*.js',
          'public/js/controllers/*Controller.js'
        ],
        dest: 'temp/collabjs.core.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        banner: '/*!\n' +
                '* <%= pkg.name %> v<%= pkg.version %>\n' +
                '* Copyright (c) 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                '* License: MIT\n' +
                '* http://www.opensource.org/licenses/mit-license.php\n' +
                '*/\n'
      },
      "js-core": {
        src: 'temp/collabjs.core.js',
        dest: 'public/js/collabjs.core.min.js'
      }
    },
    clean : ['temp']
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'concat', 'uglify', 'clean']);
};