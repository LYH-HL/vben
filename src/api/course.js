import axios from 'axios';

const mockService = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

export function getCourseList(params) {
  return mockService.get('/courses', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

export function addCourse(data) {
  return mockService.post('/courses', data);
}
export function updateCourse(id, data) {
  return mockService.put('/courses/' + id, data);
}
export function deleteCourse(id) {
  return mockService.delete('/courses/' + id);
}
