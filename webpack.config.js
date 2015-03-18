var path = require("path");
var webpack = require('webpack');
var npm_dir = path.join(__dirname, 'node_modules');
var config = {
	addVendor: function (name, path) {
		this.resolve.alias[name] = path;
		this.module.noParse.push(new RegExp('^' + name + '$'));
		this.entry.vendors.push(name);
	},
	devtool: 'source-map',
	context: __dirname,
	entry: {
		vendors: [],
		test: [
        	"webpack/hot/dev-server",
			"mocha!./test"
        ],
        typorama: [
            "./src"
        ]
	},
	resolve: {
		extensions: ['', '.js', '.json'],
		alias: {}
	},
	output: {
		path          : __dirname + '/dist',
		filename      : "[name].bundle.js",
		chunkFilename : "[id].chunk.js"
	},
	module: {
		noParse: [],
		loaders: [
			{
				test    : /\.js$/,
				exclude : /node_modules/,
				loader  : 'babel-loader?optional=selfContained'
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
		//,
		// new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
	],
	debug: true
};
//config.addVendor('react', path.join(npm_dir, '/react/dist/react-with-addons.js'));
// config.addVendor('mocha',     path.join(npm_dir, '/mocha'));
// config.addVendor('lodash',    path.join(npm_dir, 'lodash/index.js'));
// config.addVendor('immutable', path.join(npm_dir, 'immutable/dist/immutable.js'));

module.exports = config;
