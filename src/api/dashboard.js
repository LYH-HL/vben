import axios from 'axios';

const mockService = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

export function getStats() {
  return mockService.get('/stats').then((res) => res.data);
}
