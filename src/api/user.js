// 学生接口
import { service } from './auth';

// 获取学生列表（分页 + 搜索）
export function getUserList(params) {
  return service.get('/users', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

// 新增学生
export function addUser(data) {
  return service.post('/users', data);
}

// 编辑学生
export function updateUser(id, data) {
  return service.put('/users/' + id, data);
}

// 删除学生
export function deleteUser(id) {
  return service.delete('/users/' + id);
}
