// 教师接口
import { service } from './auth';

// 获取教师列表（分页 + 搜索）
export function getTeacherList(params) {
  return service.get('/teachers', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

// 新增教师
export function addTeacher(data) {
  return service.post('/teachers', data);
}

// 编辑教师
export function updateTeacher(id, data) {
  return service.put('/teachers/' + id, data);
}

// 删除教师
export function deleteTeacher(id) {
  return service.delete('/teachers/' + id);
}
