var path = require('path');
var webpack = require('webpack');

module.exports = [{
  devtool: '',
  entry: path.resolve('src','kamea.js'),
  output: {
    filename: 'kamea.min.js',
    publicPath: '/',
    library: "Kamea",
    libraryTarget: "umd"
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
}];
