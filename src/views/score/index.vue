<template>
  <div class="score-page">
    <el-card>
      <!-- 顶部：学生筛选 + 录入 -->
      <div class="search-bar">
        <el-select
          v-model="selectedStudent"
          placeholder="选择学生查看成绩"
          style="width: 220px"
          clearable
          filterable
          @change="handleStudentChange"
        >
          <el-option v-for="name in studentNames" :key="name" :label="name" :value="name" />
        </el-select>
        <el-button @click="handleReset">显示全部</el-button>
        <el-button v-if="authStore.isAdmin" type="primary" @click="openDialog()">+ 录入成绩</el-button>
      </div>

      <!-- 成绩表格 -->
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="studentName" label="学生" width="120" />
        <el-table-column prop="course" label="课程" />
        <el-table-column prop="score" label="分数" width="120">
          <template #default="{ row }">
            <span
              :style="{
                color: row.score >= 90 ? '#67c23a' : row.score >= 60 ? '#409eff' : '#f56c6c',
                fontWeight: 600,
              }"
            >
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
        <el-table-column v-if="authStore.isAdmin" label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 录入/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑成绩' : '录入成绩'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="学生" required>
          <el-select v-model="form.studentName" filterable allow-create style="width: 100%">
            <el-option v-for="name in studentNames" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" required>
          <el-select v-model="form.courseId" filterable placeholder="请选择课程" style="width: 100%">
            <el-option v-for="item in courses" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分数" required>
          <el-input-number v-model="form.score" :min="0" :max="100" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="考试类型">
          <el-select v-model="form.examType" style="width: 100%">
            <el-option label="期中" value="期中" />
            <el-option label="期末" value="期末" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="form.semester" placeholder="如：2026秋" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getScoreList, addScore, updateScore, deleteScore } from '@/api/score';
import { getUserList } from '@/api/user';
import { getCourseList } from '@/api/course';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const tableData = ref([]);
const loading = ref(false);
const selectedStudent = ref('');
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 学生名单从用户表读取，避免和数据库脱节
const studentNames = ref([]);
// 课程下拉取自课程表：成绩通过 course_id 关联，课程名由后端 JOIN 出来
const courses = ref([]);

// 弹窗
const dialogVisible = ref(false);
const editingId = ref(null);
const saving = ref(false);
const form = ref({ studentName: '', courseId: null, score: 60, examType: '期末', semester: '2026秋' });

async function loadStudents() {
  try {
    const res = await getUserList({ _page: 1, _limit: 100 });
    studentNames.value = res.list.map((item) => item.name).filter(Boolean);
  } catch {
    studentNames.value = [];
  }
}

async function loadCourses() {
  try {
    const res = await getCourseList({ _page: 1, _limit: 100 });
    courses.value = res.list;
  } catch {
    courses.value = [];
  }
}

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

function openDialog(row) {
  if (row) {
    editingId.value = row.id;
    form.value = { ...row };
  } else {
    editingId.value = null;
    form.value = {
      studentName: selectedStudent.value || '',
      courseId: courses.value.length ? courses.value[0].id : null,
      score: 60,
      examType: '期末',
      semester: '2026秋',
    };
  }
  dialogVisible.value = true;
}

async function handleSave() {
  if (!form.value.studentName || !form.value.courseId) {
    ElMessage.warning('学生和课程必填');
    return;
  }
  const value = Number(form.value.score);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    ElMessage.warning('分数必须是 0-100 之间的数字');
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      await updateScore(editingId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await addScore(form.value);
      ElMessage.success('录入成功');
    }
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error('保存失败：' + (error.response?.data?.message || error.message));
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.studentName} - ${row.course}」的成绩吗？`, '提示', {
      type: 'warning',
    });
    await deleteScore(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch {
    // 取消删除不提示
  }
}

onMounted(() => {
  loadStudents();
  loadCourses();
  fetchData();
});
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
