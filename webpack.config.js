var webpack = require('webpack');
module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		typorama                : [	'./dist/src' ],
		'test-kit'              : [ './test-kit' ],
		test                    : [
			'mocha!./test'
		],
		'examples/ReactGallery' : [ './examples/ReactGallery' ],
		'examples/benchmark'    : [ './examples/benchmark' ],
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].js',
		libraryTarget: 'umd',
		pathinfo: true
	},
	resolve: {
		extensions: ['', '.js', '.json'],
		alias: {
			typorama: __dirname + '/dist/src',
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
				loader  : 'babel-loader?optional=runtime'
			}
		],
		noParse: /\.min\.js$/
	}
};
