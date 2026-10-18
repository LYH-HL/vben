import axios from 'axios';

const mockService = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

export function getClassList(params) {
  return mockService.get('/classes', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

export function addClass(data) {
  return mockService.post('/classes', data);
}
export function updateClass(id, data) {
  return mockService.put('/classes/' + id, data);
}
export function deleteClass(id) {
  return mockService.delete('/classes/' + id);
}
