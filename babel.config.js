// babel.config.js
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    'transform-decorators-legacy',
    ['react-remove-properties', {"properties": ["data-testid"]}]
  ]
};
