
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON("package.json"),
    banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;*/\n',
    // Task configuration.
    concat: {
      options: {
        banner: "<%= banner %>",
        stripBanners: true
      },
      subs: {
          src: [
              "Babylon.js-master/dist/babylon.2.4.js",
              "Babylon.js-master/loaders/OBJ/babylon.objFileLoader.js",
              "node_modules/cannon/build/cannon.js",
              "Babylon.js-master/materialsLibrary/dist/babylon.waterMaterial.min.js",
              "app/scene.js"],
        dest: "dist/subs.js"
      },
      stats: {
          src: [
              "Babylon.js-master/dist/babylon.2.4.js",
              "Babylon.js-master/loaders/OBJ/babylon.objFileLoader.js",
              "node_modules/cannon/build/cannon.js",
              "Babylon.js-master/materialsLibrary/dist/babylon.waterMaterial.min.js",
              "app/stats.js"],
          dest: "dist/stats.js"
      }
    },
    uglify: {
      options: {
        banner: "<%= banner %>"
      },
      dist: {
        src: "<%= concat.dist.dest %>",
        dest: "dist/<%= pkg.name %>.min.js"
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: "Gruntfile.js"
      },
      scene: {
          src: ['app/*.js', 'app/**/*.js']//['app/**/*.js']
      },
      html: {
          src: ['*.html']
      }
        
    },
//    nodeunit: {
//      files: ['test/**/*_test.js']
//    },
    watch: {
      gruntfile: {
        files: "<%= jshint.gruntfile.src %>",
        tasks: ["jshint:gruntfile"]
      },
//      lib_test: {
//        files: "<%= jshint.lib_test.src %>",
//        tasks: ["jshint:lib_test", "nodeunit"]
//      },
      scene: {
          files: "<%= jshint.scene.src %>",
          tasks: ["concat", /*'uglify',*/ "copy"]
      },
      html: {
          files: "<%= jshint.html.src %>",
          tasks: ["copy"]
      }
    },
    copy: {
      main: {
              src: ["*.html","Web.config","assets/**"],
              expand: true,
              cwd: "",
              dest: "dist/"
      }
  }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy"); //eventually replace sync with copy

  // Default task.
  grunt.registerTask("default", ["concat", /*'uglify',*/ "copy"]);

};
