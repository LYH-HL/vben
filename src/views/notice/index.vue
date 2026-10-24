<template>
  <div class="notice-page">
    <el-card>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索标题/发布人"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="authStore.isAdmin" type="success" @click="openDialog()">+ 发布通知</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="publisher" label="发布人" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '通知' ? 'primary' : row.type === '公告' ? 'warning' : 'info'">{{
              row.type
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="120" />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑通知' : '发布通知'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"
          ><el-input v-model="form.content" type="textarea" :rows="4"
        /></el-form-item>
        <el-form-item label="发布人"><el-input v-model="form.publisher" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="通知" value="通知" />
            <el-option label="公告" value="公告" />
            <el-option label="新闻" value="新闻" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态"
          ><el-switch v-model="form.status" active-text="已发布" inactive-text="草稿"
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
import { getNoticeList, addNotice, updateNotice, deleteNotice } from '@/api/notice';
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
const form = ref({ title: '', content: '', publisher: '', type: '通知', status: true });

async function fetchData() {
  loading.value = true;
  try {
    const res = await getNoticeList({
      _page: page.value,
      _limit: pageSize.value,
      ...(searchKeyword.value ? { q: searchKeyword.value } : {}),
    });
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载通知列表失败：' + error.message);
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
    form.value = { title: '', content: '', publisher: '', type: '通知', status: true };
  }
  dialogVisible.value = true;
}

async function handleSave() {
  if (!form.value.title) {
    ElMessage.warning('标题必填');
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      await updateNotice(editingId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await addNotice(form.value);
      ElMessage.success('发布成功');
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
    await ElMessageBox.confirm(`确定删除通知"${row.title}"吗？`, '提示', { type: 'warning' });
    await deleteNotice(row.id);
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
