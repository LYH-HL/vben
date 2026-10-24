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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Odometer, User, Reading, School, Notebook, Document, Bell, Setting } from '@element-plus/icons-vue';

const route = useRoute();
// 当前高亮的菜单 = 当前路由路径
const activeMenu = computed(() => route.path);

// 本地菜单：图标直接用组件引用，不再靠全局注册的字符串名
const menuList = [
  { path: '/dashboard', title: '工作台', icon: Odometer },
  { path: '/user', title: '学生管理', icon: User },
  { path: '/teacher', title: '教师管理', icon: Reading },
  { path: '/class', title: '班级管理', icon: School },
  { path: '/course', title: '课程管理', icon: Notebook },
  { path: '/score', title: '成绩管理', icon: Document },
  { path: '/notice', title: '通知公告', icon: Bell },
  { path: '/settings', title: '系统设置', icon: Setting },
];
</script>

<style scoped>
.side-menu {
  border-right: none;
}
</style>
