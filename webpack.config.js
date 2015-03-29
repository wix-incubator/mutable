var webpack = require('webpack');
module.exports = {
	context: __dirname,
	entry: {
		benchmark: [
			'webpack/hot/dev-server',
			'./js-testing/benchmark'
		],
		src: [
			'./src'
		],
		'test-kit': [
			'./test-kit'
		],
		test: [
			'webpack/hot/dev-server',
			'mocha!./test'
		]
	},
	output: {
		path     : __dirname + '/dist/bundles',
		filename : '[name].bundle.js',
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
