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
import {ref,computed,onMounted} from 'vue';
import { useRoute } from 'vue-router';
import { getMenuList } from '@/api/menu';
const route = useRoute();
const activeMenu = computed(() => route.path);
const menuList = ref([]);
onMounted(async () => {
  try {
    const backendMenus = await getMenuList();
    console.log('后端返回的菜单', backendMenus);
    const fromBackend =backendMenus
      .filter((item) => item.path === '/dashboard')
      .map((item) => ({
        path: item.path,
        title: '工作台',
        icon: 'Odometer' // 使用 Odometer 图标
      }));
      
    const localMenus = [
      { path: '/user',title: '用户管理', icon: 'User' },
      { path: '/product',title:'商品管理', icon: 'Goods' },
      { path: '/settings',title: '系统设置', icon: 'Settings' },
    ];

    menuList.value = [...fromBackend, ...localMenus];
  } catch (e) {
    console.error('获取菜单失败',e);
    menuList.value = [
      { path: '/dashboard',title: '工作台', icon: 'Odometer'},
      { path: '/user',title: '用户管理', icon: 'User' },
      { path: '/product',title:'商品管理', icon: 'Goods' },
      { path: '/settings',title: '系统设置', icon: 'Settings' },
    ];
  }
});
</script>

<style scoped>
.side-menu {
  border-right: none;
}
</style>   