// 课程接口
import { service } from './auth';

// 获取课程列表（分页 + 搜索）
export function getCourseList(params) {
  return service.get('/courses', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

// 新增课程
export function addCourse(data) {
  return service.post('/courses', data);
}

// 编辑课程
export function updateCourse(id, data) {
  return service.put('/courses/' + id, data);
}

// 删除课程
export function deleteCourse(id) {
  return service.delete('/courses/' + id);
}
