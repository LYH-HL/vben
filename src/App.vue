<script setup>
// 语言包从这里统一下发给所有 Element Plus 组件
import zhCn from 'element-plus/es/locale/lang/zh-cn';
</script>

<template>
  <el-config-provider :locale="zhCn">
    <!-- 路由出口：访问 / 显示登录页 -->
    <router-view />
  </el-config-provider>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
* {
  box-sizing: border-box;
}
</style>
