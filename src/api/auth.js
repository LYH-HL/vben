import axios from 'axios';

let isHandling401 = false;

// axios 实例（指向自己的后端）
// 地址来自 VITE_API_BASE，未配置时回落到本地开发默认值
export const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3001/api',
  timeout: 10000,
});

// 请求拦截器：自动带 token
service.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 处理
service.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (isHandling401) return Promise.reject(error);
      isHandling401 = true;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('realname');
      localStorage.removeItem('role');
      ElMessage.error('登录已过期，请重新登录');
      setTimeout(() => window.location.reload(), 300);
    }
    return Promise.reject(error);
  }
);

// 登录接口
export function loginApi(data) {
  return service.post('/login', data).then((res) => {
    if (res.data.code !== 0) {
      return Promise.reject(new Error(res.data.message || '登录失败'));
    }
    return res.data.data;
  });
}

// 获取验证码（登录前调用，返回验证码ID + SVG图片）
export function getCaptcha() {
  return service.get('/captcha').then((res) => res.data.data);
}
