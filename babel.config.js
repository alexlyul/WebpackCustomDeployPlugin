module.exports = {
    presets: ['@babel/typescript', ['@babel/env', {loose: true}]],
    plugins: [['@babel/proposal-class-properties', {loose: true}], '@babel/plugin-transform-runtime'],
};
