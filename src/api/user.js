import axios from 'axios';
import {service} from './auth';
export function getUserInfo(){
    return service.get('/user/info').then((res) => {
        if (res.data.code !== 0){
            return Promise.reject(new Error(res.data.message || '获取用户信息失败'));
        }
        return res.data.data;
    })
}
const mockService = axios.create({
    baseURL: 'http://localhost:3000', // 代理转发给 vben
    timeout: 10000,
});
export function getUserList(params){
    return mockService.get('/users',{params}).then((res) => {
        return{
            list: res.data,
            total: Number(res.headers['x-total-count'] || 0)
        };
    });
};