<template>
  <div class="app-card">
    <slot></slot>
  </div>
</template>

<script setup>
// 这是一个简单的包装组件
</script>

<style scoped>
.app-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
