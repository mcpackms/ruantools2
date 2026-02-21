<template>
  <div v-if="show" class="notification" :class="type">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const show = ref(false)

// 自动显示和隐藏
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    show.value = true
    setTimeout(() => {
      show.value = false
    }, props.duration)
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 1000;
  max-width: 300px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notification.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.notification.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
