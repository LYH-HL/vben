// 通知接口
import { service } from './auth';

// 获取通知列表（分页 + 搜索）
export function getNoticeList(params) {
  return service.get('/notices', { params }).then((res) => ({
    list: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  }));
}

// 发布通知
export function addNotice(data) {
  return service.post('/notices', data);
}

// 编辑通知
export function updateNotice(id, data) {
  return service.put('/notices/' + id, data);
}

// 删除通知
export function deleteNotice(id) {
  return service.delete('/notices/' + id);
}
