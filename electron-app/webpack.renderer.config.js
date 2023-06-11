const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const assets = ['static'];
const copyPlugins = new CopyWebpackPlugin(
  {
    patterns: assets.map((asset) => ({
      from: path.resolve(__dirname, 'src', asset),
      to: path.resolve(__dirname, '.webpack/renderer', asset)
    }))
  }
);

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {

  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [copyPlugins],
  watchOptions: {
    ignored: [
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src')
    ]
  }
};
