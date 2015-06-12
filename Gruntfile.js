module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['Gruntfile.js', 'js/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
        responsive_images: {
            dev: {
                options: {
                    engine: 'im',
                    sizes: [
                        {
                            width: 400,
                            suffix: '_small',
                            quality: 75
                        }
                    ]
                },

                /*
                 You don't need to change this part if you don't change
                 the directory structure.
                 */
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'images_src/',
                    dest: 'images/'
                }]
            }
        },
        /* Clear out the production directory if it exists */
        clean: {
            dev: {
                src: ['production']
            }
        },

        /* Generate the production directory if it is missing */
        mkdir: {
            dev: {
                options: {
                    create: ['production']
                }
            }
        },

        csslint: {
            strict: {
                options: {
                    import: 2
                },
                src: ['css/*.css']
            },
            lax: {
                options: {
                    import: false
                },
                src: ['css/*.css']
            }
        },

        /* Copy the production files to the 'production' directory */
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['images/**', 'css/**', 'js/**', 'partials/**'],
                        dest: 'production/'},
                    {
                        expand: true,
                        src: '*.html',
                        dest:'production'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-csslint');

// the default task can be run just by typing "grunt" on the command line

    grunt.registerTask('lint', ['jshint', 'csslint:lax']);
    grunt.registerTask('images', ['responsive_images']);
    grunt.registerTask('produce', ['clean', 'mkdir', 'copy'])
};


