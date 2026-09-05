<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<template>
  <div class="dashboard">
    <h1>工作台</h1>
    <p>欢迎回来，<strong>{{ authStore.username }}</strong>！登录成功。</p>
    <el-button type="danger" @click="handleLogout">退出登录</el-button>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f5f7fa;
}
</style>
