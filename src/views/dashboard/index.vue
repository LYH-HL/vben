<template>
  <div class="dashboard">
    <!-- 欢迎语 -->
    <el-card shadow="never" class="welcome-card">
      <h2>欢迎使用智慧校园管理系统</h2>
      <p>当前登录：{{ username }}</p>
    </el-card>

    <!-- 统计卡片（可点击跳转） -->
    <el-row :gutter="16">
      <el-col :span="4" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" class="stat-card" @click="goTo(card.path)">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon :size="28"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ stats[card.key] ?? '-' }}</div>
            <div class="stat-title">{{ card.title }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getStats } from '@/api/dashboard';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const username = ref(authStore.username || '管理员');

const stats = ref({});
const cards = [
  { key: 'studentCount', title: '学生总数', icon: 'User', color: '#409eff', path: '/user' },
  { key: 'teacherCount', title: '教师总数', icon: 'Reading', color: '#67c23a', path: '/teacher' },
  { key: 'classCount', title: '班级总数', icon: 'School', color: '#e6a23c', path: '/class' },
  { key: 'courseCount', title: '课程总数', icon: 'Notebook', color: '#f56c6c', path: '/course' },
  { key: 'noticeCount', title: '已发布通知', icon: 'Bell', color: '#909399', path: '/notice' },
];

// 点击卡片跳转到对应管理页
function goTo(path) {
  router.push(path);
}

onMounted(async () => {
  try {
    stats.value = await getStats();
  } catch (error) {
    ElMessage.error('加载统计数据失败：' + error.message);
  }
});
</script>

<style scoped>
.welcome-card {
  margin-bottom: 16px;
}
.welcome-card h2 {
  margin: 0 0 8px;
}
.welcome-card p {
  margin: 0;
  color: #666;
}
.stat-card {
  cursor: pointer; /* 鼠标变成手型，提示可点击 */
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-4px); /* 悬停时上浮一点 */
}
.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}
.stat-title {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
</style>
