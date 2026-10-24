<template>
  <div class="teacher-page">
    <el-card>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索姓名或科目"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="authStore.isAdmin" type="success" @click="openDialog()">+ 新增教师</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="username" label="账号" />
        <el-table-column prop="subject" label="科目" width="120" />
        <el-table-column prop="title" label="职称" width="120">
          <template #default="{ row }">
            <el-tag :type="row.title === '教授' ? 'danger' : row.title === '副教授' ? 'warning' : 'info'">{{
              row.title
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'">{{ row.status ? '在职' : '离职' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="入职时间" />
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
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @current-change="fetchData"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑教师' : '新增教师'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="账号" required><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="姓名" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="科目"><el-input v-model="form.subject" /></el-form-item>
        <el-form-item label="职称">
          <el-select v-model="form.title" style="width: 100%">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态"
          ><el-switch v-model="form.status" active-text="在职" inactive-text="离职"
        /></el-form-item>
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
import { getTeacherList, addTeacher, updateTeacher, deleteTeacher } from '@/api/teacher';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const tableData = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const editingId = ref(null);
const saving = ref(false);
const form = ref({ username: '', name: '', email: '', subject: '', title: '讲师', status: true });

async function fetchData() {
  loading.value = true;
  try {
    const res = await getTeacherList({
      _page: page.value,
      _limit: pageSize.value,
      ...(searchKeyword.value ? { q: searchKeyword.value } : {}),
    });
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载教师列表失败：' + error.message);
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

function openDialog(row) {
  if (row) {
    editingId.value = row.id;
    form.value = { ...row };
  } else {
    editingId.value = null;
    form.value = { username: '', name: '', email: '', subject: '', title: '讲师', status: true };
  }
  dialogVisible.value = true;
}

async function handleSave() {
  if (!form.value.username || !form.value.name) {
    ElMessage.warning('账号和姓名必填');
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      await updateTeacher(editingId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await addTeacher(form.value);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error('保存失败：' + error.message);
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除教师"${row.name}"吗？`, '提示', { type: 'warning' });
    await deleteTeacher(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch {
    // 用户取消删除，不做提示
  }
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
