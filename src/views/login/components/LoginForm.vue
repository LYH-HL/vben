<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, ChromeFilled, ChatDotRound, Platform } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
  remember: false,
});

const formRef = ref();
const loading = ref(false);

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号长度不能少于3位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
};

async function handleLogin() {
  await formRef.value.validate();
  loading.value = true;
  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    });
    if (form.remember) {
      localStorage.setItem('remembered-username', form.username);
    } else {
      localStorage.removeItem('remembered-username');
    }
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (err) {
    ElMessage.error(err.message || '登录失败');
  } finally {
    loading.value = false;
  }
}

const remembered = localStorage.getItem('remembered-username');
if (remembered) {
  form.username = remembered;
  form.remember = true;
}
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="请输入账号" :prefix-icon="User" clearable @keyup.enter="handleLogin" />
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="form.password" type="password" placeholder="请输入密码"
                :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
    </el-form-item>
    <el-form-item>
      <div class="options-row">
        <el-checkbox v-model="form.remember">记住账号</el-checkbox>
        <el-link type="primary" :underline="false">忘记密码?</el-link>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
        登 录
      </el-button>
    </el-form-item>
  </el-form>
  <div class="login-divider"><span>其他登录方式</span></div>
  <div class="oauth-icons">
    <el-icon class="oauth-icon" title="Google"><ChromeFilled /></el-icon>
    <el-icon class="oauth-icon" title="微信"><ChatDotRound /></el-icon>
    <el-icon class="oauth-icon" title="GitHub"><Platform /></el-icon>
  </div>
</template>

<style scoped>
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.login-btn {
  width: 100%;
  letter-spacing: 4px;
}
.login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 16px;
  color: #8f959e;
  font-size: 13px;
}
.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e4e7ed;
}
.oauth-icons {
  display: flex;
  gap: 24px;
  justify-content: center;
}
.oauth-icon {
  font-size: 22px;
  color: #8f959e;
  cursor: pointer;
  transition: color 0.2s;
}
.oauth-icon:hover {
  color: #409eff;
}
</style>
