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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['cssmin']);
};