<template>
  <div class="dashboard">
    <el-card shadow="never" class="welcome-card">
      <h2>欢迎使用智慧校园管理系统</h2>
      <p>当前登录：{{ username }}</p>
    </el-card>

    <!-- 5 张卡片平分宽度：用 CSS Grid，避开 el-col 只能取整数栅格的问题 -->
    <div class="stat-grid">
      <el-card
        v-for="card in cards"
        :key="card.title"
        shadow="hover"
        class="stat-card"
        @click="goTo(card.path)"
      >
        <div class="stat-body">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon :size="28"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ stats[card.key] ?? '-' }}</div>
            <div class="stat-title">{{ card.title }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Reading, School, Notebook, Bell } from '@element-plus/icons-vue';
import { getStats } from '@/api/dashboard';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const username = ref(authStore.username || '管理员');
const stats = ref({});

const cards = [
  { key: 'studentCount', title: '学生总数', icon: User, color: '#409eff', path: '/user' },
  { key: 'teacherCount', title: '教师总数', icon: Reading, color: '#67c23a', path: '/teacher' },
  { key: 'classCount', title: '班级总数', icon: School, color: '#e6a23c', path: '/class' },
  { key: 'courseCount', title: '课程总数', icon: Notebook, color: '#f56c6c', path: '/course' },
  { key: 'noticeCount', title: '已发布通知', icon: Bell, color: '#909399', path: '/notice' },
];

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
/* 5 列等分；窄屏自动降列，避免卡片被压成竖条 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 卡片统一高度 */
.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
  height: 100px;
}
.stat-card:hover {
  transform: translateY(-4px);
}
.stat-body {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
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
