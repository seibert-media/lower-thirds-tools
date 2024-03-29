const path = require('path');
const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: [
    './src/main.ts',
    './src/css/main.scss',
    './src/css/fonts.scss',
  ],
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        use: "vue-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Compiles Sass to CSS
          {
            loader: "sass-loader",
            options: {
              //swebpackImporter: false,
              sourceMap: true,
            }
          }
        ],
        exclude: /node_modules/,
        generator: {
          filename: 'css/[name].css'
        },
        type: 'asset/resource'
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        },
      },
      {
        test: /\.(png|jpg|jpeg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'imgs/[name][ext]'
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'static', 'dist'),
    assetModuleFilename: '[name][ext][query]',
    clean: true,
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    })
  ],
};
