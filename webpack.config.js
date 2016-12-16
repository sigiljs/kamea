var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: '',
  entry: path.resolve('kamea.js'),
  output: {
    path: path.resolve('dist'),
    filename: 'kamea.min.js',
    publicPath: '/',
    library: "Kamea",
    libraryTarget: "umd"
  },

  plugins: [
    //new webpack.optimize.UglifyJsPlugin({minimize: true})
  ],
  module: {
    loaders: [
      {
        "test": /\.js?$/,
        "exclude": /node_modules/,
        "loader": "babel",
        "query": {
          "presets": [
            "es2015",
            "react",
            "stage-0"
          ],
          "plugins": []
        }
      }
    ]
  }
};
