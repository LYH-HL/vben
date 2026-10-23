<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Key, ChromeFilled, ChatDotRound, Platform } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { getCaptcha } from '@/api/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
  captchaCode: '', // 用户输入的验证码
  remember: false,
});

// 验证码状态：captchaId 是后端给的凭证，提交登录时要带上
const captchaId = ref('');
const captchaSvg = ref('');

// 加载验证码图片
async function loadCaptcha() {
  try {
    const data = await getCaptcha();
    captchaId.value = data.captchaId;
    captchaSvg.value = data.svg;
  } catch (e) {
    ElMessage.error('验证码加载失败');
  }
}

// 页面打开时先加载一次验证码
onMounted(loadCaptcha);

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
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码是4位', trigger: 'blur' },
  ],
};

async function handleLogin() {
  await formRef.value.validate();
  loading.value = true;
  try {
    await authStore.login({
      username: form.username,
      password: form.password,
      captchaId: captchaId.value,
      captchaCode: form.captchaCode,
    });
    if (form.remember) {
      localStorage.setItem('remembered-username', form.username);
    } else {
      localStorage.removeItem('remembered-username');
    }
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (err) {
    // 取后端返回的错误信息（"验证码错误"或"用户名或密码错误"）
    const msg = err.response?.data?.message || err.message || '登录失败';
    ElMessage.error(msg);
    // 登录失败：刷新验证码 + 清空输入
    loadCaptcha();
    form.captchaCode = '';
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
    <el-form-item prop="captchaCode">
      <div class="captcha-row">
        <el-input v-model="form.captchaCode" placeholder="请输入验证码" :prefix-icon="Key"
                  maxlength="4" @keyup.enter="handleLogin" />
        <!-- 验证码图片：点击刷新 -->
        <div class="captcha-img" v-html="captchaSvg" @click="loadCaptcha" title="点击刷新验证码"></div>
      </div>
    </el-form-item>
    <el-form-item>
      <div class="options-row">
        <el-checkbox v-model="form.remember">记住账号</el-checkbox>
        <el-link type="primary" underline="never">忘记密码?</el-link>
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
  gap: 10px;
  width: 100%;
}
.captcha-row .el-input {
  flex: 1;
}
/* 验证码图片区域 */
.captcha-img {
  width: 120px;
  height: 40px;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.captcha-img svg {
  width: 100%;
  height: 100%;
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
