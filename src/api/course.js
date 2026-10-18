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
