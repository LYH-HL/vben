<template>
  <div class="course-page">
    <el-card>
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索课程名/老师/班级" clearable style="width: 260px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="openDialog()">+ 新增课程</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="课程名" />
        <el-table-column prop="teacher" label="任课教师" width="120" />
        <el-table-column prop="className" label="授课班级" width="120" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="hours" label="学时" width="80" />
        <el-table-column prop="room" label="教室" width="120" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" class="pagination" @current-change="fetchData" @size-change="handleSizeChange" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑课程' : '新增课程'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="课程名" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="任课教师"><el-input v-model="form.teacher" /></el-form-item>
        <el-form-item label="授课班级"><el-input v-model="form.className" placeholder="如：高三(1)班" /></el-form-item>
        <el-form-item label="学分"><el-input v-model="form.credit" type="number" /></el-form-item>
        <el-form-item label="学时"><el-input v-model="form.hours" type="number" /></el-form-item>
        <el-form-item label="教室"><el-input v-model="form.room" /></el-form-item>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCourseList, addCourse, updateCourse, deleteCourse } from '@/api/course';

const tableData = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const editingId = ref(null);
const saving = ref(false);
const form = ref({ name: '', teacher: '', className: '', credit: 0, hours: 0, room: '' });

async function fetchData() {
  loading.value = true;
  try {
    const res = await getCourseList({
      _page: page.value,
      _limit: pageSize.value,
      ...(searchKeyword.value ? { q: searchKeyword.value } : {}),
    });
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) { ElMessage.error('加载课程列表失败：' + error.message); }
  finally { loading.value = false; }
}

function handleSearch() { page.value = 1; fetchData(); }
function handleReset() { searchKeyword.value = ''; page.value = 1; fetchData(); }
function handleSizeChange() { page.value = 1; fetchData(); }

function openDialog(row) {
  if (row) { editingId.value = row.id; form.value = { ...row }; }
  else { editingId.value = null; form.value = { name: '', teacher: '', className: '', credit: 0, hours: 0, room: '' }; }
  dialogVisible.value = true;
}

async function handleSave() {
  if (!form.value.name) { ElMessage.warning('课程名必填'); return; }
  saving.value = true;
  try {
    if (editingId.value) { await updateCourse(editingId.value, form.value); ElMessage.success('更新成功'); }
    else { await addCourse(form.value); ElMessage.success('新增成功'); }
    dialogVisible.value = false;
    fetchData();
  } catch (error) { ElMessage.error('保存失败：' + error.message); }
  finally { saving.value = false; }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除课程"${row.name}"吗？`, '提示', { type: 'warning' });
    await deleteCourse(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {}
}

onMounted(fetchData);
</script>

<style scoped>
.search-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
