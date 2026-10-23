// 工作台统计接口
import { service } from './auth';

// 获取统计数据
export function getStats() {
  return service.get('/stats').then((res) => res.data);
}
