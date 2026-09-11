<script setup>
// 主布局：整个后台的"壳"，负责 侧边栏 + 顶栏 + 内容区
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SideMenu from './components/SideMenu.vue';
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 侧边栏是否折叠
const isCollapse = ref(false);

// 面包屑文字 = 当前页面的标题（从路由 meta 取）
const pageTitle = computed(() => route.meta.title || '');

// 顶栏右侧下拉菜单
function handleCommand(command) {
  if (command === 'logout') {
    authStore.logout();
    router.push('/login');
  }
}
</script>

<template>
  <!-- el-container：Element Plus 的布局容器 -->
  <el-container class="admin-layout">
    <!-- ============ 左：侧边栏 ============ -->
    <!-- 折叠时宽度 64px，展开时 220px -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <!-- 顶部 Logo 区 -->
      <div class="sidebar-logo">
        <span v-show="!isCollapse" class="logo-text">Plus Admin</span>
        <span v-show="isCollapse" class="logo-mini">P</span>
      </div>
      <!-- 菜单组件（把折叠状态传给它） -->
      <SideMenu :collapse="isCollapse" />
    </el-aside>

    <el-container>
      <!-- ============ 顶栏 ============ -->
      <el-header class="header">
        <!-- 左边：折叠按钮 + 面包屑 -->
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <span class="breadcrumb">{{ pageTitle }}</span>
        </div>

        <!-- 右边：用户名 + 下拉退出 -->
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <!-- 头像：取用户名首字母 -->
              <el-avatar :size="30" class="user-avatar">
                {{ authStore.username ? authStore.username.charAt(0).toUpperCase() : 'U' }}
              </el-avatar>
              <span class="username">{{ authStore.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- ============ 内容区：子页面都渲染在这里 ============ -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 整体：占满整个屏幕 */
.admin-layout {
  width: 100%;
  height: 100vh;
}

/* 侧边栏：深色背景，宽度变化加过渡动画 */
.sidebar {
  background: #001529;
  transition: width 0.2s;
  overflow-x: hidden;
}

/* 侧边栏顶部 Logo 区 */
.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  background: #002140;
}

.logo-text {
  font-size: 16px;
}

.logo-mini {
  font-size: 20px;
}

/* 顶栏：白底、左右两边排开 */
.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #5a5e66;
}

.collapse-btn:hover {
  color: #409eff;
}

.breadcrumb {
  font-size: 15px;
  font-weight: 500;
  color: #1f2329;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 顶栏右侧用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1f2329;
  outline: none;
}

.user-avatar {
  background: #409eff;
  font-size: 14px;
}

.username {
  font-size: 14px;
}

/* 内容区：浅灰背景，可滚动 */
.main {
  background: #f5f7fa;
  padding: 16px;
  overflow-y: auto;
}
</style>
