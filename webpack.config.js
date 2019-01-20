const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: './index.html',
});
const cssPlugin = new ExtractTextPlugin('css/[name].[hash].css');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader',
      },
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 3,
                sourceMap: true,
              },
            },
            'resolve-url-loader',
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'compact',
                sourceMap: true,
                sourceComments: true,
              },
            },
          ],
        }),
      },
      {
        test: /.*\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                quality: 85,
              },
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: 'js/[name].[chunkhash].js',
  },
  plugins: [htmlPlugin, cssPlugin],
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: {
      name: 'manifest',
    },
  },
};
