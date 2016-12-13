var webpack = require('webpack');
var path = require('path');
var SOURCES_PATH = ['src', 'test', 'test-kit'].map(function(dir){return path.join(__dirname, dir)});

module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		'test' : ['./test/browser-test'],
		'webtest' : ['mocha!./test/browser-test']
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].bundle.js',
		libraryTarget: 'umd',
		pathinfo: true
	},
	resolve: {
		alias: {
			mutable: __dirname + '/src',
			'test-kit': __dirname + '/test-kit/'
		}
	},
	devServer: {
		contentBase: __dirname + '/dist',
		inline: true,
		hot: true
	},
	module: {
		loaders: [
			{
				test    : /\.[tj]s$/,
				include : SOURCES_PATH,
                loader: 'ts-loader?logLevel=warn&entryFileIsJs=true'
			}
		],
		noParse: /\.min\.js$/
	}
};
