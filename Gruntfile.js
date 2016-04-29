function watch(grunt){

    grunt.initConfig({

        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'public/css/app.css': 'src/sass/app.scss'
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
                    'public/css/app.css': ['public/css/normalize.css', 'public/css/app.css']
                }
            }
        },

        watch : {
          dist : {
            files : [
              'src/sass/**/*'
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