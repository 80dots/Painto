module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // drizzle 마이그레이션(.sql)을 번들에 인라인으로 포함시키기 위해 필요
      ['inline-import', { extensions: ['.sql'] }],
    ],
  };
};
