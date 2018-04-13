// Dependencies
var gulp       = require('gulp');
var nodemon    = require('gulp-nodemon');
var livereload = require('gulp-livereload');
 
// Task
gulp.task('default', function() {
	// listen for changes
	livereload.listen();
	// configure nodemon
	nodemon({
		// the script to run the app
		// exec: 'node --inspect',
		exec: 'node ',
		script: 'index.js',
		debug: true,
		ext: 'js, ejs, css',
		verbose: true
	}).on('restart', function(){
		// when the app has restarted, run livereload.
		gulp.src('index.js')
			.pipe(livereload())
	})
})