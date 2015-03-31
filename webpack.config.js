var webpack = require('webpack');
module.exports = {
	context: __dirname,
	entry: {
		benchmark: [
			'./js-testing/benchmark'
		],
		typorama: [
			'./src'
		],
		'test-kit': [
			'./test-kit'
		],
		test: [
			'mocha!./test'
		],
		examples: [ './examples']
	},
	output: {
		path     : __dirname + '/dist',
		filename : '[name].js',
		libraryTarget: 'umd'
	},
	devServer: {
		contentBase: '/',
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