import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AdminLayout from '@/layouts/admin-layout/index.vue';


// 路由表：一个数组，数组里每一项 = 一条路由规则

const routes = [
  // ---------- 第 1 条路由：登录页（独立页面，没有壳） ----------
  {
    path: '/login', // 网址路径：访问 #/login 时触发
    name: 'login', // 给这条路由起个名字，后面跳转时用
    component: () => import('@/views/login/index.vue'), // 要显示的页面组件
    meta: { title: '登录' }, // meta = 附加信息。title 是页面标题
  },

  // ---------- 第 2 条路由：后台（先进入"壳"，再进子页面） ----------
  {
    path: '/', // 网址路径：访问 #/ 时触发
    component: AdminLayout, // 先显示"壳"（侧边栏+顶栏）
    redirect: '/dashboard', // redirect = 重定向。访问 #/ 时自动跳到 #/dashboard

    // ★ 关键：children = 子路由 = 壳里面的"房间"
    // 这些页面都会显示在壳的 <router-view /> 位置
    children: [
      {
        path: 'dashboard', // 注意：子路由路径不用写 / 开头，完整地址是 /dashboard
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        // meta 里存了两个东西：
        // title：顶栏显示的面包屑文字
        // icon：侧边栏菜单的图标名（Element Plus 图标，用字符串）
        meta: { title: '工作台', icon: 'Odometer' },
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'product',
        name: 'product',
        component: () => import('@/views/product/index.vue'),
        meta: { title: '商品管理', icon: 'Goods' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' },
      },
    ],
  },
];

// 用路由表创建路由实例
const router = createRouter({
  history: createWebHashHistory(), // 使用 # 模式
  routes, // 传入上面定义的路由表
});


// 路由守卫：每次跳转页面之前，先执行这里的代码
// 作用：控制"能不能进这个页面"（登录拦截）
router.beforeEach((to) => {
  // to = 用户想去的那个页面（目标路由）
  const auth = useAuthStore(); // 获取登录状态

  // 情况 1：用户想去登录页
  if (to.name === 'login') {
    // 如果他已经登录了，就不让他看登录页，直接送去工作台
    if (auth.isLoggedIn()) return { name: 'dashboard' };
    // 没登录，放行，正常显示登录页
    return true;
  }

  // 情况 2：用户想去其他任何页面（工作台、用户管理……）
  // 如果没登录，拦下来，送回登录页
  if (!auth.isLoggedIn()) return { name: 'login' };

  // 设置浏览器标签页的标题（显示在浏览器顶部）
  document.title = to.meta.title ? `${to.meta.title} - Plus Admin` : 'Plus Admin';

  return true; // 放行（return true 表示允许进入）
});

// 导出路由，给 main.js 使用
export default router;
