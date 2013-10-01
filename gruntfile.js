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
      js: {
        src: 'public/js/collabjs.js',
        dest: 'public/js/collabjs.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'uglify']);
};