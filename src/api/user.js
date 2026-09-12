import {service} from '/auth';
export function getUserInfo(){
    return service.get('/user/info').then((res) => {
        if (res.data.code !== 0){
            return Promise.reject(new Error(res.data.message || '获取用户信息失败'));
        }
        return res.data.data;
    })
}