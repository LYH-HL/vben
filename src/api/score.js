// 成绩接口
import { service } from './auth';

// 获取成绩列表（支持 student 参数按学生筛选）
export function getScoreList(params) {
  return service.get('/scores', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

// 录入成绩
export function addScore(data) {
  return service.post('/scores', data);
}

// 修改成绩
export function updateScore(id, data) {
  return service.put('/scores/' + id, data);
}

// 删除成绩
export function deleteScore(id) {
  return service.delete('/scores/' + id);
}
