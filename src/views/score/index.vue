<template>
  <div class="score-page">
    <el-card>
      <!-- 顶部：学生选择器 -->
      <div class="search-bar">
        <el-select
          v-model="selectedStudent"
          placeholder="选择学生查看成绩"
          style="width: 220px"
          clearable
          @change="handleStudentChange"
        >
          <el-option
            v-for="name in studentNames"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
        <el-button @click="handleReset">显示全部</el-button>
      </div>

      <!-- 成绩表格 -->
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="studentName" label="学生" width="120" />
        <el-table-column prop="course" label="课程" />
        <el-table-column prop="score" label="分数" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.score >= 90 ? '#67c23a' : row.score >= 60 ? '#409eff' : '#f56c6c', fontWeight: 600 }">
              {{ row.score }} 分
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="examType" label="考试类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.examType === '期末' ? 'success' : 'warning'">
              {{ row.examType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column label="评级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.score >= 90" type="success">优秀</el-tag>
            <el-tag v-else-if="row.score >= 80" type="primary">良好</el-tag>
            <el-tag v-else-if="row.score >= 60" type="warning">及格</el-tag>
            <el-tag v-else type="danger">不及格</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
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
import { getScoreList } from '@/api/score';

// 学生名单（和后端一致）
const studentNames = ['王萌', '张雨欣', '李浩', '陈梦琪', '刘洋', '王浩宇', '赵磊', '孙佳怡', '周晓彤', '吴杰', '林佳', '许文博'];

const tableData = ref([]);
const loading = ref(false);
const selectedStudent = ref('');
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

async function fetchData() {
  loading.value = true;
  try {
    const params = {
      _page: page.value,
      _limit: pageSize.value,
    };
    if (selectedStudent.value) {
      params.student = selectedStudent.value;
    }
    const res = await getScoreList(params);
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载成绩失败：' + error.message);
  } finally {
    loading.value = false;
  }
}

function handleStudentChange() {
  page.value = 1;
  fetchData();
}

function handleReset() {
  selectedStudent.value = '';
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
