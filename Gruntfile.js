function watch(grunt){

    grunt.initConfig({

        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'templates/css/app.css': 'assets/sass/app.scss'
                }
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'templates/css/app.css': ['templates/css/normalize.css', 'templates/css/app.css']
                }
            }
        },

        watch : {
          dist : {
            files : [
              'assets/sass/**/*'
            ],

            tasks : ['sass', 'cssmin']

          }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('w', ['watch']);
}

module.exports = watch;