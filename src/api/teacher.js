import axios from 'axios';

// 指向自己的后端
const mockService = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// 获取教师列表（分页 + 搜索）
export function getTeacherList(params) {
  return mockService.get('/teachers', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

export function addTeacher(data) {
  return mockService.post('/teachers', data);
}
export function updateTeacher(id, data) {
  return mockService.put('/teachers/' + id, data);
}
export function deleteTeacher(id) {
  return mockService.delete('/teachers/' + id);
}
