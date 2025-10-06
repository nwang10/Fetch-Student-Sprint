module.exports = {
  extends: ['@repo/config/eslint-preset'],
  env: {
    node: true,
  },
  ignorePatterns: ['dist', 'node_modules'],
};
