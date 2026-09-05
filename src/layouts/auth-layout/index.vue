<template>
  <div class="auth-layout">
    <!-- 左半区：品牌展示 -->
    <div class="auth-brand">
      <div class="brand-header">
        <div class="brand-logo">P</div>
        <span class="brand-name">Plus Admin</span>
      </div>

      <!-- 把 src/assets/ 里你自己的图片路径填进来 -->
      <img src="@/assets/login-bg.jpg" alt="brand" class="brand-illustration" />

      <div class="brand-slogan">
        <h2>开箱即用的大型中后台管理系统</h2>
        <p>工程化、高性能、跨组件库的前端模版</p>
      </div>
    </div>

    <!-- 右半区：登录表单塞进这里 -->
    <div class="auth-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.auth-brand {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 64px;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  color: #fff;
  overflow: hidden;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #409eff, #18a058);
  font-weight: 700;
  font-size: 20px;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
}

.brand-illustration {
  max-width: 70%;
  margin: 0 auto;
  object-fit: contain;
}

.brand-slogan h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.brand-slogan p {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.auth-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
</style>
