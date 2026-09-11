<script setup>
// 用户管理页：表格展示 + 搜索 + 分页（数据为假数据，以后换接口）
import { ref } from 'vue';
import { Search, Plus } from '@element-plus/icons-vue';

// 假数据
const userList = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: true, createdAt: '2026-09-01' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: true, createdAt: '2026-09-02' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '访客', status: false, createdAt: '2026-09-03' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '编辑', status: true, createdAt: '2026-09-04' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: '访客', status: true, createdAt: '2026-09-05' },
]);

// 搜索关键词
const keyword = ref('');

// 当前页 / 每页条数
const currentPage = ref(1);
const pageSize = ref(10);
</script>

<template>
  <div class="page">
    <!-- 页头：标题 + 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" :icon="Plus">新增用户</el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="toolbar">
      <div class="search-row">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名"
          clearable
          style="width: 240px"
          :prefix-icon="Search"
        />
        <el-button type="primary">搜索</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="userList" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="100">
          <!-- 用标签显示角色 -->
          <template #default="{ row }">
            <el-tag :type="row.role === '管理员' ? 'danger' : 'primary'" size="small">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <!-- 用开关显示启用状态 -->
          <template #default="{ row }">
            <el-switch v-model="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="130" />
        <el-table-column label="操作" width="140">
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="userList.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #1f2329;
}

.toolbar {
  margin-bottom: 16px;
}

.toolbar :deep(.el-card__body) {
  padding: 12px 16px;
}

.search-row {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
