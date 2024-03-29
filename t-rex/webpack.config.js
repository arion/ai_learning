const path = require('path');

module.exports = {
  entry: './src/game.js',
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: false
  },
  watch: true
};