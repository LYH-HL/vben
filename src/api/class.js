// 班级接口
import { service } from './auth';

// 获取班级列表（分页 + 搜索）
export function getClassList(params) {
  return service.get('/classes', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

// 新增班级
export function addClass(data) {
  return service.post('/classes', data);
}

// 编辑班级
export function updateClass(id, data) {
  return service.put('/classes/' + id, data);
}

// 删除班级
export function deleteClass(id) {
  return service.delete('/classes/' + id);
}
