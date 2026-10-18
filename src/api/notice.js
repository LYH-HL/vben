import axios from 'axios';

const mockService = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

export function getNoticeList(params) {
  return mockService.get('/notices', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}
