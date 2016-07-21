var webpack = require('webpack');
var path = require('path');

var NODE_MODULES_PATH = path.resolve(__dirname, 'node_modules');

module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		'mutable'              : [	'./src' ],
		'test-kit'              : [ './test-kit' ],
		'test'                  : ['./test'],
		'webtest'               : ['mocha!./test']
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].bundle.js',
		libraryTarget: 'umd',
		pathinfo: true
	},
	resolve: {
		//extensions: ['', '.js', '.json'],
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
				test    : /\.js$/,
				exclude : NODE_MODULES_PATH,
				loader  : 'babel-loader'
			}
		],
		noParse: /\.min\.js$/
	}
};
