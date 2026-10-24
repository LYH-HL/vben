import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 的「函数式 API」自动导入（ElMessage / ElMessageBox），
    // 显式指向组件子路径。故意不用 ElementPlusResolver：它生成的是
    // `from 'element-plus/es'` 桶导入，会把整个组件库拉进包里，
    // 实测反而从 393 KB 涨到 950 KB，按需引入完全失效。
    AutoImport({
      imports: [
        { 'element-plus/es/components/message/index.mjs': ['ElMessage'] },
        { 'element-plus/es/components/message-box/index.mjs': ['ElMessageBox'] },
      ],
    }),
  ],
  resolve: {
    alias: {
      // 让 @ 指向 src 目录
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // 把体积大、更新频率低的依赖拆成独立 chunk，避免一次发版就让整包缓存失效。
        // 必须用函数形式：写成 { 'element-plus': ['element-plus'] } 会强制把
        // element-plus 的入口 barrel 拉进依赖图，按需引入的摇树同样会失效。
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('element-plus')) return 'element-plus';
          if (
            id.includes('/vue/') ||
            id.includes('/@vue/') ||
            id.includes('vue-router') ||
            id.includes('/pinia/')
          ) {
            return 'vue';
          }
          return undefined;
        },
      },
    },
  },
});
