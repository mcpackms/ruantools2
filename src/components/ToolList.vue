<!-- src/components/ToolList.vue -->
<template>
  <div>
    <!-- 可用工具 -->
    <section class="tools-section">
      <h2 class="section-title">可用工具</h2>
      <div class="tools-grid">
        <a 
          v-for="tool in availableTools" 
          :key="tool.id"
          :href="tool.path" 
          class="tool-item"
        >
          <div class="tool-header">
            <h3 class="tool-name">{{ tool.name }}</h3>
            <span class="tool-category">{{ tool.category }}</span>
          </div>
          <p class="tool-description">{{ tool.description }}</p>
          <div class="tool-status">
            <span class="tool-link">立即使用 →</span>
          </div>
        </a>
      </div>
    </section>
    
    <!-- 即将上线 -->
    <section v-if="upcomingTools.length > 0" class="tools-section">
      <h2 class="section-title">即将上线</h2>
      <div class="tools-grid">
        <div 
          v-for="tool in upcomingTools" 
          :key="tool.id"
          class="tool-item coming-soon"
          @click="handleComingSoonClick"
        >
          <div class="tool-header">
            <h3 class="tool-name">{{ tool.name }}</h3>
            <span class="tool-category">{{ tool.category }}</span>
          </div>
          <p class="tool-description">{{ tool.description }}</p>
          <div class="tool-status">
            <span class="coming-soon-badge">开发中</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { tools } from '../data/tools';

// 计算属性：可用工具
const availableTools = computed(() => 
  tools.filter(t => !t.comingSoon)
);

// 计算属性：即将上线的工具
const upcomingTools = computed(() => 
  tools.filter(t => t.comingSoon)
);

// 处理即将上线工具的点击事件
const handleComingSoonClick = () => {
  alert('该工具正在开发中，即将上线！');
};
</script>

<style scoped>
.tools-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}

/* 工具卡片 - 简洁版 */
.tool-item {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.tool-item:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.tool-item.coming-soon {
  opacity: 0.7;
  cursor: not-allowed;
}

.tool-item.coming-soon:hover {
  border-color: var(--border-color);
  box-shadow: none;
  transform: none;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.tool-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tool-category {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary);
  background: rgba(37, 99, 235, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.tool-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
}

.tool-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary);
  text-decoration: none;
}

.tool-link:hover {
  text-decoration: underline;
}

.coming-soon-badge {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
}
</style>
