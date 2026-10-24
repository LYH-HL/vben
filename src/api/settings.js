// 系统设置接口
import { service } from './auth';

// 读取系统设置
export function getSettings() {
  return service.get('/settings').then((res) => res.data);
}

// 保存系统设置
export function saveSettings(data) {
  return service.put('/settings', data).then((res) => res.data);
}
