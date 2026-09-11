<script setup>
// 商品管理页：表格 + 状态筛选（假数据，以后换接口）
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const productList = ref([
  { id: 1, name: '键盘', price: '¥299', stock: 120, category: '数码', status: true },
  { id: 2, name: '鼠标', price: '¥89', stock: 350, category: '数码', status: true },
  { id: 3, name: '椅子', price: '¥599', stock: 30, category: '家具', status: false },
  { id: 4, name: '水', price: '¥79', stock: 500, category: '生活', status: true },
  { id: 5, name: '显示器', price: '¥1299', stock: 15, category: '数码', status: true },
]);

const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary">新增商品</el-button>
    </div>

    <el-card shadow="never" class="toolbar">
      <div class="search-row">
        <el-input
          v-model="keyword"
          placeholder="搜索商品名称"
          clearable
          style="width: 240px"
          :prefix-icon="Search"
        />
        <el-button type="primary">搜索</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="productList" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="上架状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'" size="small">
              {{ row.status ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="productList.length"
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
