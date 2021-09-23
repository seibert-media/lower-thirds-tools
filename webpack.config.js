const path = require('path');

module.exports = {
  entry: [
    './static.src/js/main.ts',
    './static.src/css/main.scss'
  ],
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
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
        //type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
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
    assetModuleFilename: '[name][ext][query]'
  },
};
