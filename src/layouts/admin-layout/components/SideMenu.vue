<template>
  <el-menu
    :default-active="activeMenu"
    class="side-menu"
    router
    background-color="#001529"
    text-color="#fff"
    active-text-color="#1890ff"
  >
    <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
      <el-icon><component :is="item.icon"></component></el-icon>
      <span>{{ item.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
// ref：响应式变量；computed：计算属性；onMounted：页面加载后执行
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// 从接口拿菜单（vben5 的菜单接口）
import { getMenuList } from '@/api/menu';

const route = useRoute();
// 当前高亮的菜单 = 当前路由路径
const activeMenu = computed(() => route.path);
// 菜单列表（接口返回 + 本地补充合并）
const menuList = ref([]);

onMounted(async () => {
  try {
    // 调接口拿后端菜单
    const backendMenus = await getMenuList();
    // 只从后端菜单里取"工作台"这一项
    const fromBackend = backendMenus
      .filter((item) => item.path === '/dashboard')
      .map((item) => ({
        path: item.path,
        title: '工作台',
        icon: 'Odometer',
      }));
    // 本地菜单：智慧校园各模块
    const localMenus = [
      { path: '/user', title: '学生管理', icon: 'User' },
      { path: '/teacher', title: '教师管理', icon: 'Reading' },
      { path: '/class', title: '班级管理', icon: 'School' },
      { path: '/course', title: '课程管理', icon: 'Notebook' },
      { path: '/score', title: '成绩管理', icon: 'Document' },
      { path: '/notice', title: '通知公告', icon: 'Bell' },
      { path: '/settings', title: '系统设置', icon: 'Setting' },
    ];
    // 合并：工作台在最前面，后面跟本地菜单
    menuList.value = [...fromBackend, ...localMenus];
  } catch (e) {
    console.error('获取菜单失败', e);
    // 接口失败时用兜底菜单（保证菜单还能显示）
    menuList.value = [
      { path: '/dashboard', title: '工作台', icon: 'Odometer' },
      { path: '/user', title: '学生管理', icon: 'User' },
      { path: '/teacher', title: '教师管理', icon: 'Reading' },
      { path: '/class', title: '班级管理', icon: 'School' },
      { path: '/course', title: '课程管理', icon: 'Notebook' },
      { path: '/score', title: '成绩管理', icon: 'Document' },
      { path: '/notice', title: '通知公告', icon: 'Bell' },
      { path: '/settings', title: '系统设置', icon: 'Setting' },
    ];
  }
});
</script>

<style scoped>
.side-menu {
  border-right: none;
}
</style>
