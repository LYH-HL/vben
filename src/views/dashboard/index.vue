<script setup>
// 工作台页面：登录成功后的主页面
// 当前版本包含：问候区 + 4个统计卡片 + 最近动态
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
// Element Plus 图标（main.js 里已全局注册，这里直接可用）
import { View, User, ShoppingCart, Money, ArrowUp, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();

// ---- 退出登录 ----
function handleLogout() {
  authStore.logout();
  router.push('/login');
}

// ---- 根据当前时间生成问候语 ----
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

// ---- 今天的日期（显示在问候区） ----
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// ---- 统计卡片数据（目前是写死的假数据，以后换成接口返回） ----
const stats = [
  { title: '今日访问量', value: '2,846', icon: View, trend: '+12.5%', up: true },
  { title: '新增用户', value: '128', icon: User, trend: '+3.2%', up: true },
  { title: '今日订单', value: '356', icon: ShoppingCart, trend: '-1.8%', up: false },
  { title: '本月收入', value: '¥86,420', icon: Money, trend: '+8.6%', up: true },
];

// ---- 最近动态（假数据，以后接接口） ----
const activities = [
  { time: '10 分钟前', content: '用户「小明」完成了订单 #20240907001' },
  { time: '1 小时前', content: '新注册用户 23 人，较昨日同期增长 12%' },
  { time: '3 小时前', content: '系统完成每日数据备份，耗时 42 秒' },
  { time: '昨天 18:30', content: '运营团队更新了首页轮播图配置' },
  { time: '昨天 09:12', content: '「商品管理」模块发布 v1.2.0 版本' },
];
</script>

<template>
  <div class="dashboard">
    <!-- ============ 问候区 ============ -->
    <div class="welcome-bar">
      <div>
        <h1 class="welcome-title">{{ getGreeting() }}，{{ authStore.username }}</h1>
        <p class="welcome-date">{{ getToday() }}，欢迎回来，祝你今天工作顺利！</p>
      </div>
      <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
    </div>

    <!-- ============ 统计卡片区 ============ -->
    <!-- el-row 栅格布局：一行分 4 列（每列 24/4=6），间距 16px -->
    <el-row :gutter="16" class="stats-row">
      <!-- 遍历 stats 数组，自动生成 4 张卡片 -->
      <el-col :span="6" v-for="item in stats" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <!-- 左边：图标圆块 -->
            <div class="stat-icon">
              <el-icon :size="22"><component :is="item.icon" /></el-icon>
            </div>
            <!-- 右边：数值 + 标题 + 涨跌标签 -->
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
              <!-- 涨跌：涨用红色箭头，跌用绿色（国内习惯红涨绿跌） -->
              <el-tag :type="item.up ? 'danger' : 'success'" size="small" effect="light">
                <el-icon :size="12">
                  <component :is="item.up ? ArrowUp : ArrowDown" />
                </el-icon>
                {{ item.trend }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ============ 最近动态区 ============ -->
    <el-card shadow="never" class="activity-card">
      <template #header>
        <span class="card-title">最近动态</span>
      </template>
      <!-- el-timeline：Element Plus 时间线组件，适合展示动态 -->
      <el-timeline>
        <el-timeline-item
          v-for="(act, index) in activities"
          :key="index"
          :timestamp="act.time"
          placement="top"
        >
          {{ act.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped>
/* 页面整体：内边距 + 浅灰背景 */
.dashboard {
  padding: 8px;
}

/* 问候区：左右分两行排（左边文字，右边退出按钮） */
.welcome-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.welcome-title {
  margin: 0 0 6px;
  font-size: 22px;
  color: #1f2329;
}

.welcome-date {
  margin: 0;
  font-size: 14px;
  color: #8f959e;
}

/* 统计卡片行 */
.stats-row {
  margin-bottom: 24px;
}

/* 卡片内部：图标在左，数据在右 */
.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  background: #ecf5ff;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2329;
  line-height: 1.2;
}

.stat-title {
  font-size: 13px;
  color: #8f959e;
  margin: 2px 0 6px;
}

/* 最近动态卡片 */
.activity-card {
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}
</style>
