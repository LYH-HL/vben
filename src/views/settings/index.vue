<script setup>
// 系统设置页：读写后端 /api/settings（仅管理员可保存）
import { reactive, ref, onMounted } from 'vue';
import { getSettings, saveSettings } from '@/api/settings';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = reactive({
  siteName: '',
  description: '',
  email: '',
  darkMode: false,
});

const loading = ref(false);
const saving = ref(false);

async function loadSettings() {
  loading.value = true;
  try {
    const data = await getSettings();
    Object.assign(form, data);
  } catch (error) {
    ElMessage.error('读取设置失败：' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const data = await saveSettings({ ...form });
    Object.assign(form, data.data);
    ElMessage.success('保存成功');
  } catch (error) {
    ElMessage.error('保存失败：' + (error.response?.data?.message || error.message));
  } finally {
    saving.value = false;
  }
}

onMounted(loadSettings);
</script>

<template>
  <div v-loading="loading" class="page">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <span v-if="!authStore.isAdmin" class="readonly-hint">当前账号只读，保存需要管理员权限</span>
    </div>

    <el-card shadow="never" class="settings-card">
      <el-form :model="form" label-width="100px" style="max-width: 560px">
        <el-form-item label="系统名称">
          <el-input v-model="form.siteName" :disabled="!authStore.isAdmin" />
        </el-form-item>

        <el-form-item label="系统描述">
          <el-input v-model="form.description" type="textarea" :rows="3" :disabled="!authStore.isAdmin" />
        </el-form-item>

        <el-form-item label="联系邮箱">
          <el-input v-model="form.email" :disabled="!authStore.isAdmin" />
        </el-form-item>

        <el-form-item label="深色模式">
          <el-switch v-model="form.darkMode" :disabled="!authStore.isAdmin" />
        </el-form-item>

        <el-form-item v-if="authStore.isAdmin">
          <el-button type="primary" :loading="saving" @click="handleSave">保存设置</el-button>
          <el-button @click="loadSettings">重新读取</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #1f2329;
}

.readonly-hint {
  font-size: 13px;
  color: #909399;
}

.settings-card {
  max-width: 720px;
}
</style>
