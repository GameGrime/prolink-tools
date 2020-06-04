import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpackMerge from 'webpack-merge';

import {baseConfig, IS_PROD} from './webpack.config.base';

/**
 * Becuase prolink-connect bundles mikro-orm, which does not work well in
 * browser context, we stub it out.
 *
 * XXX: This may be brittle...
 */
const removeMikroORM = new webpack.NormalModuleReplacementPlugin(
  /mikro-orm/,
  (resource: any) => {
    resource.request = path.join(__dirname, 'src/renderer/mikrormShim.ts');
  }
);

const config: webpack.Configuration = webpackMerge.smart(baseConfig, {
  target: 'electron-renderer',
  entry: {
    app: './src/renderer/app.tsx',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  optimization: {minimize: false},
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg)$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    removeMikroORM,
    new HtmlWebpackPlugin(),
    ...(!IS_PROD ? [new ReactRefreshWebpackPlugin()] : []),
    new ForkTsCheckerWebpackPlugin({
      reportFiles: ['src/renderer/**/*', 'src/shared/**/*'],
    }),
  ],
  devServer: {
    port: 2003,
    compress: true,
    stats: 'errors-only',
    inline: true,
    hot: true,
    headers: {'Access-Control-Allow-Origin': '*'},
    historyApiFallback: {
      verbose: true,
    },
  },
});

export default config;