/* jshint node:true */
'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        config: {
            distDir: 'dist',
            examplesDir: 'examples',
            scriptsDir: 'scripts',
            stylesDir: 'styles',
            tempDir: '.tmp'
        },
        babel: {
            options: {
                sourceMaps: 'inline',
                stage: 0
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.scriptsDir %>/',
                    src: '**/*.js',
                    dest: '<%= config.tempDir %>/scripts/'
                }]
            }
        },
        // browserify: {
        //     dist: {
        //         files: [{
        //             expand: true,
        //             cwd: '<%= config.tempDir %>/scripts/',
        //             src: '*.js',
        //             dest: '<%= config.distDir %>/'
        //         }]
        //     }
        // },
        clean: ['.tmp', '<%= config.distDir %>'],
        concat: {
            dist: {

            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                livereload: 35729,
                port: 9000,
            },
            livereload: {
                options: {
                    base: [
                        '<%= config.destDir %>',
                        '<%= config.examplesDir %>'
                    ],
                    open: true
                }
            }
        },
        csso: {
            options: {
                banner: '/* coins-logon-widget */\n'
            },
            dist: {
                expand: true,
                cwd: '<%= config.distDir %>/',
                src: ['*.css', '!*.min.css'],
                dest: '<%= config.distDir %>/',
                ext: '.min.css'
            }
        },
        postcss: {
            options: {
                map: true, // Inline sourcemap
                processors: [
                    require('autoprefixer-core')({ browsers: 'last 3 versions' })
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp',
                    src: '*.css',
                    dest: '<%= config.distDir %>/'
                }]
            },
        },
        sass: {
            options: {
                sourceMap: true,
                sourceMapEmbed: true,
                sourceMapContents: true,
                includePaths: ['.']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.stylesDir %>',
                    src: ['*.scss'],
                    dest: '.tmp/',
                    ext: '.css'
                }]
            }
        },
        uglify: {
            options: {
                mangle: true
                // screwIE8: true
            },
            dist: {
                files: {
                    '<%= config.distDir %>/coins-logon-widget.min.js' : ['<%= config.distDir %>/*.js']
                }
            }
        },
        umd: {
            coinsLogonWidget: {
                src: '<%= config.tempDir %>/scripts/coins-logon-widget.js',
                objectToExport: 'CoinsLogonWidget',
                amdModuleId: 'coinslogonwidget',
                deps: {
                    'default': ['EventEmitter', 'assign', 'forEach', 'uniqueId'],
                    amd: ['eventemitter', 'lodash/object/assign', 'lodash/collection/forEach', 'lodash/utility/uniqueId'],
                    cjs: ['wolfy87-eventemitter', 'lodash/object/assign', 'lodash/collection/forEach', 'lodash/utility/uniqueId'],
                    global: ['EventEmitter', '_.assign', '_.forEach', '_.uniqueId']
                }
            }
            // coinsLogonWidgetAuth: {
            //     src: '<%= config.tempDir %>/scripts/coins-logon-widget-auth.js',
            //     objectToExport: 'Auth',
            //     amdModuleId: 'coinslogonwidgetauth',
            //     deps: {
            //         'default': ['cookies'],
            //         amd: ['browsercookies'],
            //         cjs: ['browser-cookies'],
            //         global: ['cookies']
            //     }
            // }
        },
        watch: {
            css: {
                files: '.tmp/*.css',
                tasks: ['postcss']
            },
            sass: {
                files: '<%= config.stylesDir %>/**/*.scss',
                tasks: ['sass']
            },
            js: {
                files: '<%= config.scriptsDir %>/**/*.js',
                tasks: ['babel', 'umd', 'browserify']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.distDir %>/*.{css,js}',
                    '<%= config.examplesDir %>/**/*'
                ]
            }
        }
    });

    grunt.registerTask('default', ['clean', 'sass', 'postcss', 'babel', 'umd']);
    grunt.registerTask('build', ['default', 'csso', 'uglify']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
};
