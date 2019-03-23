const path = require('path');

const { NODE_ENV } = process.env;

const resolve = pathname => path.resolve(__dirname, pathname);
const nodeModule = name => require.resolve(name);

module.exports = {
  devtool: Object.is(NODE_ENV, 'development') ? 'cheap-module-source-map' : false,
  stats: { children: false },
  context: resolve('../src'),
  entry: {
    main: resolve('../src/index.js'),
    vendor: [nodeModule('react'), nodeModule('react-dom')],
  },
  output: {
    path: resolve('../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    modules: [resolve('../node_modules')],
    extensions: ['.web.js', '.js', '.json', '.jsx'],
    alias: {
      '@': resolve('../src'),
      components: resolve('../src/components'),
      constants: resolve('../src/constants'),
      helpers: resolve('../src/helpers'),
      assets: resolve('../src/assets'),
      styles: resolve('../src/styles'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: resolve('../src'),
        exclude: /(node_modules|bower_components|dist)/,
        use: nodeModule('babel-loader'),
      },
      {
        test: /\.(png|svg)$/,
        include: resolve('../src'),
        exclude: /(node_modules|bower_components|dist)/,
        loader: nodeModule('url-loader'),
      },
    ],
  },
  plugins: [extractSass],
  externals: {
    // Use the React dependency of our parent-testing-project instead of using our own React.
    react: 'commonjs react',
  },
};
