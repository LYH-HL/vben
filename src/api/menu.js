import { service } from './auth';
export function getMenuList() {
    return service.get('/menu/all').then((res) => {
        if (res.data.code !== 0) {
            return Promise.reject(new Error(res.data.message || '获取菜单失败'));
        }
        return res.data.data;
    });
}  