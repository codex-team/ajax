const webpack = require('webpack');

/**
 * Final webpack config
 */
module.exports = {
  entry: './src/index.js',
  output: {
    library: 'ajax',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      /**
       * Process JS files
       */
      {
        test : /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [ "@babel/preset-env" ]
          }
        }
      }
    ]
  },
  watch: true,
  mode: process.env.NODE_ENV || 'development'
};
