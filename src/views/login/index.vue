<script setup>
import AuthLayout from '@/layouts/auth-layout/index.vue';
import LoginForm from './components/LoginForm.vue';
</script>

<template>
  <AuthLayout>
    <div class="login-panel">
      <h1 class="login-title">欢迎回来</h1>
      <p class="login-subtitle">请输入您的账户信息以开始管理您的项目</p>
      <LoginForm />
    </div>
  </AuthLayout>
</template>

<style scoped>
.login-panel {
  width: 360px;
}
.login-title {
  margin: 0 0 8px;
  font-size: 26px;
  color: #1f2329;
}
.login-subtitle {
  margin: 0 0 28px;
  font-size: 14px;
  color: #8f959e;
}
</style>
