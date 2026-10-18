<template>
  <div class="class-page">
    <el-card>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索班级名/年级/班主任"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="班级" />
        <el-table-column prop="grade" label="年级" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.grade }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="headTeacher" label="班主任" />
        <el-table-column prop="studentCount" label="学生数" width="100" />
        <el-table-column prop="room" label="教室" width="100" />
        <el-table-column prop="createdAt" label="创建时间" />
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @current-change="fetchData"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getClassList } from '@/api/class';

const tableData = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

async function fetchData() {
  loading.value = true;
  try {
    const res = await getClassList({
      _page: page.value,
      _limit: pageSize.value,
      ...(searchKeyword.value ? { q: searchKeyword.value } : {}),
    });
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载班级列表失败：' + error.message);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchData();
}

function handleReset() {
  searchKeyword.value = '';
  page.value = 1;
  fetchData();
}

function handleSizeChange() {
  page.value = 1;
  fetchData();
}

onMounted(fetchData);
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
