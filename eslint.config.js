// ESLint 扁平配置（ESLint 9+）
import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'server/node_modules/**', '.tmp-api-test/**', 'pnpm-lock.yaml'],
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // 由 unplugin-auto-import 自动注入，不需要手写 import
        ElMessage: 'readonly',
        ElMessageBox: 'readonly',
      },
    },
    rules: {
      // 开发期允许留日志，但不允许留未使用的变量
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 页面组件都是 index.vue，不强制多单词命名
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    // 后端是 CommonJS
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  {
    // 构建/测试脚本是 ESM + Node
    files: ['scripts/**/*.mjs', '*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // 必须放最后：关掉与 Prettier 冲突的格式类规则
  prettier,
];
