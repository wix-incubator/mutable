var webpack = require('webpack');
module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		'typorama'              : [	'./src' ],
		'test-kit'              : [ './test-kit' ],
		'test'                  : ['./test'],
		'webtest'               : ['mocha!./test'],
		'examples/ReactGallery' : [ './examples/ReactGallery' ],
		'examples/benchmark'    : [ './examples/benchmark' ],
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
			typorama: __dirname + '/src',
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
				exclude : /node_modules/,
				loader  : 'babel-loader'
			}
		],
		noParse: /\.min\.js$/
	}
};
