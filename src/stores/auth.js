import { ref } from 'vue';
import { defineStore } from 'pinia';
import { loginApi } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // 登录凭证，从 localStorage 读取实现"记住登录"
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');

  const isLoggedIn = () => !!token.value;

  async function login(params) {
    const res = await loginApi(params);
    token.value = res.token;
    username.value = res.username;
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
  }

  function logout() {
    token.value = '';
    username.value = '';
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  return { token, username, isLoggedIn, login, logout };
});
