<script setup>
// 系统设置页：表单 + 保存（目前只提示，不真实保存）
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const form = reactive({
  siteName: 'Plus Admin',
  description: '开箱即用的大型中后台管理系统',
  email: 'admin@example.com',
  darkMode: false,
});

function handleSave() {
  ElMessage.success('保存成功（演示）');
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <el-card shadow="never" class="settings-card">
      <el-form :model="form" label-width="100px" style="max-width: 560px">
        <el-form-item label="系统名称">
          <el-input v-model="form.siteName" />
        </el-form-item>

        <el-form-item label="系统描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="联系邮箱">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="深色模式">
          <el-switch v-model="form.darkMode" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #1f2329;
}

.settings-card {
  max-width: 720px;
}
</style>
