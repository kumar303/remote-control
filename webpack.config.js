const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    'extension/dist/background': './src/background',
    'extension/dist/popup': './src/popup',
    'remote-control/dist/remote-control': './src/remote-control',
  },
  output: {
    path: './',
    filename: '[name].js',
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      test: /\.js$/,
      // babel options are in .babelrc
      loaders: ['babel'],
    }],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: [
      path.resolve(__dirname),
    ],
    modulesDirectories: [
      'src',
      'node_modules',
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
  devtool: 'sourcemap',
};
