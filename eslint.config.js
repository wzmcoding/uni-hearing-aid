const uni = require('@uni-helper/eslint-config')
const unocss = require('@unocss/eslint-plugin')

module.exports = uni(
  {
    overrides: {
      uni: {
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      },
    },
    rules: {
      'eslint-comments/no-unlimited-disable': 0,
      'curly': ['error', 'all'],
      'no-empty': 1,
      'no-console': 0,
      'unused-imports/no-unused-vars': 1,
      'unused-imports/no-unused-imports': 1,
      'vue/no-unused-vars': 1,
      'no-async-promise-executor': 0,
      'vue/custom-event-name-casing': 0,
      'style/arrow-parens': ['error', 'always'],
      'style/brace-style': ['error', 'stroustrup'],
      'style/operator-linebreak': ['error', 'before'],
      'style/quote-props': ['error', 'consistent-as-needed'],
    },
  },
  unocss.configs.flat,
  {
    ignores: [
      '*.sh',
      'node_modules',
      '*.md',
      '*.woff',
      '*.ttf',
      '.vscode',
      '.idea',
      'dist',
      '/public',
      '/docs',
      '.husky',
      '.local',
      '/bin',
      'Dockerfile',
      'src/uni_modules/**',
    ],
  },
)
