// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

// Read .env file and parse contents
const env = dotenv.parse(fs.readFileSync('.env'));

// Create an object with all the environment variables prefixed with 'process.env.'
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: './src/index.js',
  target: 'web', // Changed from 'electron-renderer' to 'web'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    globalObject: 'this',
  },
  devtool: 'source-map', // Enable source maps for debugging
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      // Exclude Node.js modules
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      assert: false,
      constants: false,
      events: false,
      vm: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin(envKeys),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3000,
    hot: false, // Disable hot module replacement
    liveReload: true, // Enable live reload
    client: {
      overlay: true,
      logging: 'info',
      webSocketTransport: 'ws',
    },
  },
};
