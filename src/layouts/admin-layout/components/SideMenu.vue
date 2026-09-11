<script setup>
// 侧边栏菜单：从路由表自动生成菜单项
// 好处：以后加页面只需在 router 里加一条，菜单自动出现（vben5 的路由驱动菜单思路）
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';

// 接收父组件传来的"是否折叠"
const props = defineProps({
  collapse: { type: Boolean, default: false },
});

const route = useRoute();

// 菜单列表 = 路由表里 AdminLayout 的 children（过滤掉没有标题的）
const menuList = computed(() => {
  const layoutRoute = router.options.routes.find((r) => r.path === '/');
  return (layoutRoute?.children || []).filter((r) => r.meta?.title);
});

// 当前高亮的菜单项 = 当前访问的路径
const activeMenu = computed(() => route.path);
</script>

<template>
  <!-- router 模式：点菜单自动跳转到 index 对应的路径 -->
  <el-menu
    :default-active="activeMenu"
    router
    :collapse="props.collapse"
    background-color="#001529"
    text-color="rgba(255,255,255,0.68)"
    active-text-color="#fff"
  >
    <!-- 遍历路由 children 生成菜单项 -->
    <el-menu-item v-for="item in menuList" :key="item.path" :index="'/' + item.path">
      <!-- meta.icon 是图标名字符串，用 <component :is> 动态渲染 -->
      <el-icon>
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta.title }}</span>
    </el-menu-item>
  </el-menu>
</template>
