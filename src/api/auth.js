import axios from 'axios';
import { ElMessage } from 'element-plus';

let isHandling401 = false;

// axios 实例（指向自己的后端）
export const service = axios.create({
  baseURL: 'http://localhost:3001/api',
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
      ElMessage.error('登录已过期，请重新登录');
      setTimeout(() => window.location.reload(), 300);
    }
    return Promise.reject(error);
  }
);

// 登录接口（指向自己的后端）
export function loginApi(data) {
  return service.post('/login', data).then((res) => {
    if (res.data.code !== 0) {
      return Promise.reject(new Error(res.data.message || '登录失败'));
    }
    return res.data.data;
  });
}
