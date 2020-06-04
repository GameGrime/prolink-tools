import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

export const IS_PROD = process.env.NODE_ENV === 'production';

const babelOptions = {
  cacheDirectory: true,
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
  plugins: [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    !IS_PROD && require.resolve('react-refresh/babel'),
  ].filter(Boolean),
};

export const baseConfig: webpack.Configuration = {
  mode: IS_PROD ? 'production' : 'development',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      main: path.resolve(__dirname, 'src/main/'),
      app: path.resolve(__dirname, 'src/renderer/'),
      src: path.resolve(__dirname, 'src/'),
    },
  },
  devtool: 'source-map',

  plugins: [new webpack.EnvironmentPlugin({WEBPACK: true, NODE_ENV: 'development'})],

  optimization: {
    minimizer: [
      // MikroORM rqeuires that class names do NOT be changed
      new TerserPlugin({terserOptions: {mangle: false}}),
    ],
    namedModules: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelOptions,
      },
    ],
  },
};