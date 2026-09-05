<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Key, ChromeFilled, ChatDotRound, Platform } from '@element-plus/icons-vue';
import { generateCaptcha } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false,
});

const formRef = ref();
const loading = ref(false);

// 验证码
const captchaUrl = ref('');
let captchaAnswer = '';
function refreshCaptcha() {
  const captcha = generateCaptcha();
  captchaUrl.value = captcha.dataUrl;
  captchaAnswer = captcha.text;
}
refreshCaptcha();

// 校验规则
const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号长度不能少于3位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
};

// 点击登录
async function handleLogin() {
  await formRef.value.validate();

  if (form.captcha.toUpperCase() !== captchaAnswer) {
    ElMessage.error('验证码错误');
    refreshCaptcha();
    return;
  }

  loading.value = true;
  try {
    await authStore.login({
      username: form.username,
      password: form.password,
      captcha: form.captcha,
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
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
}

// 记住账号自动回填
const remembered = localStorage.getItem('remembered-username');
if (remembered) {
  form.username = remembered;
  form.remember = true;
}
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="请输入账号" :prefix-icon="User" clearable />
    </el-form-item>

    <el-form-item prop="password">
      <el-input v-model="form.password" type="password" placeholder="请输入密码"
                :prefix-icon="Lock" show-password />
    </el-form-item>

    <el-form-item prop="captcha">
      <div class="captcha-row">
        <el-input v-model="form.captcha" placeholder="请输入验证码" :prefix-icon="Key"
                  @keyup.enter="handleLogin" />
        <img :src="captchaUrl" alt="验证码" class="captcha-img"
             title="点击刷新验证码" @click="refreshCaptcha" />
      </div>
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
.captcha-row {
  display: flex;
  width: 100%;
  gap: 8px;
}
.captcha-img {
  width: 120px;
  height: 44px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  object-fit: cover;
  flex-shrink: 0;
}
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
