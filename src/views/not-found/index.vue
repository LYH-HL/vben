<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function goHome() {
  router.replace(authStore.isLoggedIn() ? '/dashboard' : '/login');
}
</script>

<template>
  <div class="not-found">
    <div class="code">404</div>
    <h2 class="title">页面不存在</h2>
    <p class="desc">你访问的地址没有对应的页面，可能是链接输错了，或者该功能已经下线。</p>
    <p class="path">当前地址：{{ $route.fullPath }}</p>
    <el-button type="primary" @click="goHome">
      {{ authStore.isLoggedIn() ? '返回工作台' : '去登录' }}
    </el-button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
  text-align: center;
}
.code {
  font-size: 88px;
  font-weight: 700;
  line-height: 1;
  color: #dcdfe6;
  letter-spacing: 4px;
}
.title {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #1f2329;
}
.desc {
  margin: 0 0 8px;
  font-size: 14px;
  color: #8f959e;
}
.path {
  margin: 0 0 24px;
  font-size: 13px;
  color: #a8abb2;
  font-family: Consolas, Monaco, monospace;
  word-break: break-all;
}
</style>
