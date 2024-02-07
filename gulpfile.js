var settings = {
	clean: true, // check
	scripts: true, // check
	polyfills: true, //check
	styles: true,
	critical: false, // check
	purge: false, // check
	images: true, // check
    fonts: true,
    copy: true,
	reload: true
};


/**
 * Paths to project folders
 */

var paths = {
	input: 'src/',
	output: 'dist/',
	scripts: {
		input: 'src/js/*',
		polyfills: '.polyfill.js',
		output: 'dist/js/'
	},
	styles: {
		input: 'src/sass/**/*.{scss,sass}',
		output: 'dist/css/'
	},
	images: {
		input: 'src/img/*',
		output: 'dist/img/'
	},
	copy: {
		input: 'src/copy/**/*',
		output: 'dist/'
	},
    fonts: {
        input: 'src/font/*',
        output: 'dist/font/'
    },
	reload: './dist/'
};


/**
 * Gulp Packages
 */

// General
var {gulp, src, dest, watch, series, parallel}        = require('gulp'),
    del = require('del'),
    flatmap = require('gulp-flatmap'),
    lazypipe = require('lazypipe'),
    rename = require('gulp-rename'),

    // Scripts
    jshint = require('gulp-jshint');
    stylish = require('jshint-stylish');
    concat = require('gulp-concat');
    terser = require('gulp-terser');
    //optimizejs = require('gulp-optimize-js');
    
    // Styles
    //sass        = require('gulp-sass'),
	sass        = require('gulp-sass')(require("node-sass")),
    postcss = require('gulp-postcss'),
    prefix = require('autoprefixer'),
	minify = require('cssnano'),

    // Remove unused, generate critical css and inject into html
    // purgecss = require('gulp-purgecss'),
	critical = require('critical').stream,
	// penthouse = require("penthouse"),

    // Images Minification
    imagemin = require('gulp-imagemin'),
    
    // Log Generation
    log = require('fancy-log'),

    browserSync = require('browser-sync').create();


/**
 * Gulp Tasks
*/

// Remove pre-existing content from output folders
var cleanDist = function (done) {

	// Make sure this feature is activated before running
	if (!settings.clean) return done();

	// Clean the dist folder
	del.sync([
		paths.output
	]);

	// Signal completion
	return done();

};


// Repeated JavaScript tasks
var jsTasks = lazypipe()
	//.pipe(header, banner.main, {package: package})
	//.pipe(optimizejs)
	.pipe(dest, paths.scripts.output)
	.pipe(rename, {suffix: '.min'})
	.pipe(terser)
	//.pipe(optimizejs)
	// .pipe(header, banner.main, {package: package})
    .pipe(dest, paths.scripts.output);
    
// Lint, minify, and concatenate scripts
var buildScripts = function (done) {

	// Make sure this feature is activated before running
	if (!settings.scripts) return done();

	// Run tasks on script files
	return src(paths.scripts.input)
		.pipe(flatmap(function(stream, file) {

			// If the file is a directory
			if (file.isDirectory()) {

				// Setup a suffix variable
				var suffix = '';

				// If separate polyfill files enabled
				if (settings.polyfills) {

					// Update the suffix
					suffix = '.polyfills';

					// Grab files that aren't polyfills, concatenate them, and process them
					src([file.path + '/*.js', '!' + file.path + '/*' + paths.scripts.polyfills])
						.pipe(concat(file.relative + '.js'))
						.pipe(jsTasks());

				}

				// Grab all files and concatenate them
				// If separate polyfills enabled, this will have .polyfills in the filename
				src(file.path + '/*.js')
					.pipe(concat(file.relative + suffix + '.js'))
					.pipe(jsTasks());

				return stream;

			}

			// Otherwise, process the file
			return stream.pipe(jsTasks());

		}));

};

// Lint scripts
var lintScripts = function (done) {

	// Make sure this feature is activated before running
	if (!settings.scripts) return done();

	// Lint scripts
	return src(paths.scripts.input)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));

};

// Process, lint, and minify Sass files
var buildStyles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.styles) return done();

	// Run tasks on all Sass files
	return src(paths.styles.input)
		.pipe(sass({
			outputStyle: 'expanded',
			sourceComments: true
		}))
		.pipe(postcss([
			prefix({
				cascade: true,
				remove: true
			})
		]))
		.pipe(dest(paths.styles.output))
		.pipe(rename({suffix: '.min'}))
		.pipe(postcss([
			minify({
				discardComments: {
					removeAll: true
				}
			})
		]))
		.pipe(dest(paths.styles.output))
};


// Optimize Images
var buildImgs = function (done) {

	// Make sure this feature is activated before running
	if (!settings.images) return done();

	// Optimize Images files
	return src(paths.images.input)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
                ]
              })
            ]))
		.pipe(dest(paths.images.output));
};

// Copy static files into output folder
var copyFiles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.copy) return done();

	// Copy static files
	return src(paths.copy.input)
		.pipe(dest(paths.copy.output));

};

var purgestyles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.purge) return done();

    return src('./dist/css/*.css')
        .pipe(purgecss({
			content: ['./dist/*.html', './dist/js/*.js']
        }))
        .pipe(dest('./dist/css'))
};



// Critical Path CSS - Generate Above the fold css and inject into html head after generating final html files in dist folder
 /*var criticalHome = function (done) {
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/index.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/new-home.min.css',
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};


var criticalSearch = function (done) {
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/search.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/search.min.css',
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

var criticalDetails = function (done) {
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src(['dist/project-details.html', 'dist/resale-details.html', 'dist/rental-details.html'])
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/project-details.min.css',
			'dist/css/listing-details.min.css',
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

// var criticalResaleRental = function (done) {
	
// 	// Make sure this feature is activated before running
// 	if (!settings.styles) return done();

// 	// Critical CSS
// 	return src(['dist/resale-details.html', 'dist/rental-details.html'])
// 		.pipe(critical({
// 		base: paths.reload,
// 		inline: true,
// 		css: [
// 			'dist/css/main.min.css',
// 			'dist/css/listing-details.min.css',
// 		]
// 		}))
// 		.on('error', err => {
// 		log.error(err.message);
// 		})
// 		.pipe(dest(paths.reload));

// };

var criticalAgent = function (done) {
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/agent-profile.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/agent-profile.min.css',
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

var criticalBlog = function (done) {
	
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/blog.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/blog.min.css'
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

var criticalEvent = function (done) {
	
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src(['dist/events.html', 'dist/event-details.html'])
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/events.min.css',
			'dist/css/event-details.min.css'
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

var criticalLeads = function (done) {
	
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/leads.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/leads.min.css'
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

var criticalCampaign = function (done) {
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/ghar-campaign.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/ghar-campaign.min.css',
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

};

var criticalDealkaro = function (done) {
	
	// Make sure this feature is activated before running
	if (!settings.critical) return done();

	// Critical CSS
	return src('dist/deals-karo.html')
		.pipe(critical({
		base: paths.reload,
		inline: true,
		css: [
			'dist/css/main.min.css',
			'dist/css/deals-karo.min.css',
		]
		}))
		.on('error', err => {
		log.error(err.message);
		})
		.pipe(dest(paths.reload));

}; */


// Watch for changes to the src directory
var startServer = function (done) {

	// Make sure this feature is activated before running
	if (!settings.reload) return done();

	// Initialize BrowserSync
	browserSync.init({
		server: {
			baseDir: paths.reload
		}
	});

	// Signal completion
	done();

};

// Reload the browser when files change
var reloadBrowser = function (done) {
	if (!settings.reload) return done();
	browserSync.reload();
	done();
};

// Watch for changes
var watchSource = function (done) {
	watch(paths.input, series(exports.default, reloadBrowser));
	done();
};


/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(
	cleanDist,
	parallel(
		buildScripts,
		lintScripts,
		buildStyles,
		buildImgs,
		copyFiles
	),
	purgestyles
	/*criticalHome
	criticalDealkaro,
	criticalCampaign,
	criticalSearch,
	criticalDetails,
	criticalAgent,
	criticalBlog,
	criticalEvent,
	criticalLeads */
);

// Watch and reload
// gulp watch
exports.watch = series(
	exports.default,
	startServer,
	watchSource
);