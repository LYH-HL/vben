<template>
  <div class="user-page">
    <el-card>
      <!-- 搜索栏 + 新增按钮 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或姓名"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="authStore.isAdmin" type="success" @click="openDialog()">+ 新增学生</el-button>
      </div>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'">
              {{ row.status ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" />
        <!-- 操作列 -->
        <el-table-column v-if="authStore.isAdmin" label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑学生' : '新增学生'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="学生" value="学生" />
            <el-option label="管理员" value="管理员" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="停用" />
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
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const tableData = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const editingId = ref(null);
const saving = ref(false);
const form = ref({ username: '', name: '', email: '', role: '学生', status: true });

async function fetchData() {
  loading.value = true;
  try {
    const res = await getUserList({
      _page: page.value,
      _limit: pageSize.value,
      ...(searchKeyword.value ? { q: searchKeyword.value } : {}),
    });
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载用户列表失败：' + error.message);
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

// 打开新增/编辑弹窗
function openDialog(row) {
  if (row) {
    // 编辑
    editingId.value = row.id;
    form.value = { ...row };
  } else {
    // 新增
    editingId.value = null;
    form.value = { username: '', name: '', email: '', role: '学生', status: true };
  }
  dialogVisible.value = true;
}

// 保存（新增或编辑）
async function handleSave() {
  if (!form.value.username || !form.value.name) {
    ElMessage.warning('用户名和姓名必填');
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      await updateUser(editingId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await addUser(form.value);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchData(); // 刷新列表
  } catch (error) {
    ElMessage.error('保存失败：' + error.message);
  } finally {
    saving.value = false;
  }
}

// 删除
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除学生"${row.name}"吗？`, '提示', { type: 'warning' });
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch {
    // 用户点取消就不提示
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
