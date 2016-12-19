var webpack = require('webpack');
var path = require('path');
var SOURCES_PATH = ['src', 'test', 'test-kit'].map(function(dir){return path.join(__dirname, 'dist', dir)});

module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		'test' : [path.join(__dirname, 'dist', 'test', 'browser-test')],
		'webtest' : ['mocha!'+path.join(__dirname, 'dist', 'test', 'browser-test')]
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].bundle.js',
		libraryTarget: 'umd',
		pathinfo: true
	},
	resolve: {
		alias: {
			mutable: path.join(__dirname, 'dist', 'src'),
			'test-kit': path.join(__dirname, 'dist', 'test-kit')
		}
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		inline: true,
		hot: true
	},
	module: {
		loaders: [
			// {
			// 	test    : /\.[tj]s$/,
			// 	include : SOURCES_PATH,
             //    loader: 'ts-loader?logLevel=warn&entryFileIsJs=true'
			// }
		],
		noParse: [/\.min\.js$/, /\.bundle\.js$/]
	}
};
