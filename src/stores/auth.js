import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { loginApi } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // 登录凭证，从 localStorage 读取实现"记住登录"
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const realname = ref(localStorage.getItem('realname') || '');
  const role = ref(localStorage.getItem('role') || '');

  // 是否已登录
  const isLoggedIn = () => !!token.value;
  // 是否管理员：后端据此放行写操作，前端据此显示/隐藏按钮
  const isAdmin = computed(() => role.value === '管理员');

  async function login(params) {
    const res = await loginApi(params);
    token.value = res.accessToken;
    username.value = res.username;
    realname.value = res.realname || '';
    role.value = res.role || '';
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('username', res.username);
    localStorage.setItem('realname', realname.value);
    localStorage.setItem('role', role.value);
  }

  function logout() {
    token.value = '';
    username.value = '';
    realname.value = '';
    role.value = '';
    // 四个键都要清：只清前两个会让下一个登录的人看到上一个人的姓名和角色
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('realname');
    localStorage.removeItem('role');
  }

  return { token, username, realname, role, isLoggedIn, isAdmin, login, logout };
});
