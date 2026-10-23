// 成绩接口
import { service } from './auth';

// 获取成绩列表（支持 student 参数按学生筛选）
export function getScoreList(params) {
  return service.get('/scores', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}
