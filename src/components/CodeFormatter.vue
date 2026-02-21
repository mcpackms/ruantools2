<template>
  <div class="code-formatter-container">
    <!-- 语言选择器 -->
    <div class="language-selector">
      <label for="language" class="section-label">选择编程语言:</label>
      <div class="select-wrapper">
        <select v-model="selectedLanguage" @change="handleLanguageChange" id="language">
          <option value="json">JSON</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="javascript">JavaScript</option>
          <option value="xml">XML</option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div class="grid-container">
      <!-- 输入区域 -->
      <div class="input-output-section">
        <div class="section-header">
          <label for="input" class="section-label">输入代码</label>
          <div class="example-buttons">
            <button @click="loadExample" class="btn btn-secondary">加载示例</button>
            <button @click="clearInput" class="btn btn-secondary">清空</button>
          </div>
        </div>
        
        <textarea
          id="input"
          v-model="inputCode"
          @input="handleInput"
          :placeholder="placeholderText"
          class="input-textarea"
          spellcheck="false"
        ></textarea>

        <!-- 格式化选项 -->
        <div class="format-options">
          <h3 class="options-title">格式化选项</h3>
          <div class="options-grid">
            <div class="option-group">
              <label class="option-label">
                <input type="checkbox" v-model="options.indentWithTabs">
                使用 Tab 缩进
              </label>
            </div>
            
            <div class="option-group">
              <label class="option-label">
                缩进大小:
                <input 
                  type="range" 
                  v-model="options.indentSize" 
                  min="1" 
                  max="8" 
                  class="slider"
                >
                {{ options.indentSize }}
              </label>
            </div>
            
            <div class="option-group" v-if="selectedLanguage === 'json'">
              <label class="option-label">
                <input type="checkbox" v-model="options.sortKeys">
                按字母顺序排序键
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 输出区域 -->
      <div class="input-output-section">
        <div class="section-header">
          <label class="section-label">格式化结果</label>
          <div class="button-group">
            <button @click="formatCode" class="btn btn-primary">格式化</button>
            <button @click="copyOutput" class="btn btn-success" :disabled="!outputCode">
              {{ copyButtonText }}
            </button>
            <button @click="toggleTheme" class="btn btn-secondary">
              {{ theme === 'light' ? '🌞 浅色主题' : '🌙 深色主题' }}
            </button>
          </div>
        </div>
        
        <div class="output-wrapper">
          <div class="language-badge">{{ languageNames[selectedLanguage] }}</div>
          <pre 
            class="code-output" 
            :class="theme"
            ref="outputElement"
            v-html="highlightedOutput"
          ></pre>
        </div>

        <!-- 状态信息 -->
        <div class="status-info">
          <div class="status-item">
            <span class="status-label">代码长度:</span>
            <span class="status-value">{{ inputCode.length }} 字符</span>
          </div>
          <div class="status-item">
            <span class="status-label">行数:</span>
            <span class="status-value">{{ inputLines.length }} 行</span>
          </div>
          <div class="status-item" v-if="formatTime">
            <span class="status-label">格式化耗时:</span>
            <span class="status-value">{{ formatTime }}ms</span>
          </div>
          <div class="status-item" v-if="errorMessage">
            <span class="status-label error">错误:</span>
            <span class="status-value error">{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// 响应式数据
const selectedLanguage = ref('json');
const inputCode = ref('');
const outputCode = ref('');
const errorMessage = ref('');
const copyButtonText = ref('复制结果');
const theme = ref('light');
const formatTime = ref(0);

// 格式化选项
const options = ref({
  indentSize: 2,
  indentWithTabs: false,
  sortKeys: false,
  wrapAttributes: true
});

// 语言显示名称映射
const languageNames = {
  json: 'JSON',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  xml: 'XML'
};

// 计算属性
const placeholderText = computed(() => {
  const examples = {
    json: '例如：{"name": "张三", "age": 25, "hobbies": ["阅读", "编程"]}',
    python: '例如：def hello(name):\n    print(f"Hello, {name}!")\n\nhello("World")',
    java: '例如：public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
    c: '例如：#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}',
    cpp: '例如：#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}',
    html: '例如：<!DOCTYPE html>\n<html>\n<head>\n    <title>示例</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>',
    css: '例如：body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 0;\n}',
    javascript: '例如：function greet(name) {\n    console.log(`Hello, ${name}!`);\n    return `Hello, ${name}!`;\n}',
    xml: '例如：<root>\n    <person>\n        <name>张三</name>\n        <age>25</age>\n    </person>\n</root>'
  };
  return examples[selectedLanguage.value] || '输入代码进行格式化...';
});

const inputLines = computed(() => {
  return inputCode.value.split('\n');
});

const highlightedOutput = computed(() => {
  if (!outputCode.value || errorMessage.value) {
    return errorMessage.value ? 
      `<span class="error-message">❌ ${errorMessage.value}</span>` : 
      '<span class="placeholder">等待输入...</span>';
  }
  
  return highlightCode(outputCode.value);
});

// 方法
const loadExample = () => {
  const examples = {
    json: `{
  "users": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "roles": ["admin", "user"],
      "profile": {
        "age": 28,
        "city": "北京"
      }
    },
    {
      "id": 2,
      "name": "李四",
      "email": "lisi@example.com",
      "roles": ["user"],
      "profile": {
        "age": 32,
        "city": "上海"
      }
    }
  ],
  "total": 2,
  "success": true
}`,
    python: `def fibonacci(n):
    """
    计算斐波那契数列的第n项
    """
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# 测试
if __name__ == "__main__":
    for i in range(10):
        print(f"fibonacci({i}) = {fibonacci(i)}")`,
    java: `public class Calculator {
    private double result;
    
    public Calculator() {
        this.result = 0;
    }
    
    public void add(double value) {
        this.result += value;
    }
    
    public void subtract(double value) {
        this.result -= value;
    }
    
    public void multiply(double value) {
        this.result *= value;
    }
    
    public void divide(double value) {
        if (value != 0) {
            this.result /= value;
        } else {
            throw new ArithmeticException("除数不能为零");
        }
    }
    
    public double getResult() {
        return this.result;
    }
    
    public void reset() {
        this.result = 0;
    }
}`
  };
  
  inputCode.value = examples[selectedLanguage.value] || examples.json;
  formatCode();
};

const clearInput = () => {
  inputCode.value = '';
  outputCode.value = '';
  errorMessage.value = '';
};

const handleLanguageChange = () => {
  outputCode.value = '';
  errorMessage.value = '';
};

const handleInput = () => {
  // JSON 实时格式化
  if (selectedLanguage.value === 'json') {
    try {
      formatJSON(inputCode.value);
    } catch {
      // 忽略 JSON 解析错误
    }
  }
};

const formatCode = () => {
  if (!inputCode.value.trim()) {
    errorMessage.value = '请输入代码';
    return;
  }
  
  const startTime = performance.now();
  
  try {
    let formatted = '';
    const code = inputCode.value;
    
    switch(selectedLanguage.value) {
      case 'json':
        formatted = formatJSON(code);
        break;
      case 'html':
      case 'xml':
        formatted = formatHTML(code);
        break;
      case 'css':
        formatted = formatCSS(code);
        break;
      case 'javascript':
        formatted = formatJavaScript(code);
        break;
      case 'python':
        formatted = formatPython(code);
        break;
      case 'java':
      case 'c':
      case 'cpp':
        formatted = formatGeneral(code);
        break;
      default:
        formatted = code;
    }
    
    outputCode.value = formatted;
    errorMessage.value = '';
    formatTime.value = Math.round(performance.now() - startTime);
  } catch (error) {
    errorMessage.value = error.message;
    outputCode.value = '';
  }
};

const formatJSON = (code) => {
  const indent = options.value.indentWithTabs ? '\t' : ' '.repeat(options.value.indentSize);
  
  try {
    const obj = JSON.parse(code);
    let replacer = null;
    
    if (options.value.sortKeys) {
      replacer = (key, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return Object.keys(value)
            .sort()
            .reduce((sorted, key) => {
              sorted[key] = value[key];
              return sorted;
            }, {});
        }
        return value;
      };
    }
    
    return JSON.stringify(obj, replacer, indent);
  } catch (error) {
    throw new Error(`JSON 解析错误: ${error.message}`);
  }
};

const formatHTML = (code) => {
  const indent = options.value.indentWithTabs ? '\t' : ' '.repeat(options.value.indentSize);
  const lines = code.split('\n');
  let result = [];
  let indentLevel = 0;
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // 处理结束标签
    if (trimmed.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    result.push(indent.repeat(indentLevel) + trimmed);
    
    // 处理开始标签（非自闭合）
    if (trimmed.startsWith('<') && 
        !trimmed.startsWith('</') && 
        !trimmed.endsWith('/>') && 
        !trimmed.endsWith('-->') &&
        trimmed.includes('>')) {
      indentLevel++;
    }
  }
  
  return result.join('\n');
};

const formatCSS = (code) => {
  const indent = options.value.indentWithTabs ? '\t' : ' '.repeat(options.value.indentSize);
  let result = [];
  let indentLevel = 0;
  
  const lines = code.split('\n');
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.endsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    result.push(indent.repeat(indentLevel) + trimmed);
    
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }
  
  return result.join('\n');
};

const formatJavaScript = (code) => {
  const indent = options.value.indentWithTabs ? '\t' : ' '.repeat(options.value.indentSize);
  let result = [];
  let indentLevel = 0;
  
  const lines = code.split('\n');
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.endsWith('}') || trimmed.endsWith(']') || trimmed.endsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    result.push(indent.repeat(indentLevel) + trimmed);
    
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indentLevel++;
    }
  }
  
  return result.join('\n');
};

const formatPython = (code) => {
  const indentChar = options.value.indentWithTabs ? '\t' : ' '.repeat(options.value.indentSize);
  let result = [];
  let indentLevel = 0;
  
  const lines = code.split('\n');
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // 减少缩进（遇到某些关键字）
    if (trimmed && 
        (trimmed.startsWith('return') || 
         trimmed.startsWith('pass') || 
         trimmed.startsWith('break') || 
         trimmed.startsWith('continue') ||
         trimmed.startsWith('elif ') ||
         trimmed.startsWith('else:') ||
         trimmed.startsWith('except') ||
         trimmed.startsWith('finally:'))) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    result.push(indentChar.repeat(indentLevel) + trimmed);
    
    // 增加缩进（以冒号结尾且不是注释）
    if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
      indentLevel++;
    }
  }
  
  return result.join('\n');
};

const formatGeneral = (code) => {
  const indentChar = options.value.indentWithTabs ? '\t' : ' '.repeat(options.value.indentSize);
  let result = [];
  let indentLevel = 0;
  
  const lines = code.split('\n');
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // 减少缩进
    if (trimmed.endsWith('}') || trimmed.endsWith(']') || trimmed.endsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    result.push(indentChar.repeat(indentLevel) + trimmed);
    
    // 增加缩进
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indentLevel++;
    }
  }
  
  return result.join('\n');
};

const highlightCode = (code) => {
  // 简单的语法高亮实现
  const lang = selectedLanguage.value;
  let highlighted = code;
  
  // 防止 XSS
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // JSON 高亮
  if (lang === 'json') {
    highlighted = highlighted
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?/g, (match, p1, p2, p3) => {
        if (p3) {
          return `<span class="json-key">${match}</span>`;
        } else {
          return `<span class="json-string">${p1}</span>`;
        }
      })
      .replace(/\b(true|false|null)\b/g, '<span class="json-boolean">$&</span>')
      .replace(/\b\d+\b/g, '<span class="json-number">$&</span>');
  }
  
  // 通用关键字高亮
  const keywords = {
    python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'as', 'return', 'yield', 'try', 'except', 'finally', 'with', 'async', 'await', 'True', 'False', 'None'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'int', 'String', 'boolean', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'super', 'true', 'false', 'null'],
    c: ['int', 'float', 'double', 'char', 'void', 'struct', 'if', 'else', 'for', 'while', 'return', 'include', 'define', 'sizeof', 'NULL'],
    cpp: ['int', 'float', 'double', 'char', 'void', 'class', 'public', 'private', 'protected', 'virtual', 'template', 'namespace', 'using', 'if', 'else', 'for', 'while', 'return', 'new', 'delete', 'true', 'false', 'nullptr'],
    javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'async', 'await', 'true', 'false', 'null', 'undefined'],
    html: ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<span', '<p', '<h1', '<h2', '<h3', '<a', '<img', '<ul', '<li', '<table', '<form', '<input'],
    css: ['body', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'margin', 'padding', 'color', 'background', 'font', 'width', 'height', 'display', 'position']
  };
  
  if (keywords[lang]) {
    const keywordPattern = new RegExp(`\\b(${keywords[lang].join('|')})\\b`, 'g');
    highlighted = highlighted.replace(keywordPattern, '<span class="keyword">$&</span>');
  }
  
  // 注释高亮
  if (['python', 'java', 'c', 'cpp', 'javascript', 'css'].includes(lang)) {
    highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
  }
  
  if (['python'].includes(lang)) {
    highlighted = highlighted.replace(/#.*$/gm, '<span class="comment">$&</span>');
  }
  
  if (['html', 'xml'].includes(lang)) {
    highlighted = highlighted.replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="comment">$&</span>');
  }
  
  // 字符串高亮
  highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
  highlighted = highlighted.replace(/'([^']*)'/g, "<span class=\"string\">'$1'</span>");
  
  // 数字高亮
  highlighted = highlighted.replace(/\b\d+\b/g, '<span class="number">$&</span>');
  
  return highlighted;
};

const copyOutput = async () => {
  if (!outputCode.value) return;
  
  try {
    await navigator.clipboard.writeText(outputCode.value);
    copyButtonText.value = '✓ 已复制';
    setTimeout(() => {
      copyButtonText.value = '复制结果';
    }, 2000);
  } catch (error) {
    console.error('复制失败:', error);
    copyButtonText.value = '复制失败';
  }
};

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};
</script>

<style scoped>
.code-formatter-container {
  width: 100%;
}

.language-selector {
  margin-bottom: 24px;
  max-width: 400px;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-wrapper select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-top: 24px;
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: 1fr 1fr;
  }
}

.input-output-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.input-output-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-label {
  display: block;
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
}

.input-textarea {
  flex: 1;
  min-height: 300px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 16px;
}

.input-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-textarea::placeholder {
  color: #9ca3af;
}

.output-wrapper {
  position: relative;
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.language-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
}

.code-output {
  flex: 1;
  min-height: 300px;
  max-height: 500px;
  padding: 16px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-output.light {
  background-color: #f9fafb;
  color: #1f2937;
}

.code-output.dark {
  background-color: #1e293b;
  color: #f1f5f9;
}

.error-message {
  color: #ef4444;
  font-weight: 500;
}

.placeholder {
  color: #9ca3af;
  font-style: italic;
}

.format-options {
  margin-top: 16px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.options-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
}

.option-description {
  font-size: 0.75rem;
  color: #6b7280;
}

.slider {
  width: 80px;
  margin: 0 8px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
}

.example-buttons {
  display: flex;
  gap: 8px;
}

.status-info {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.status-item {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.status-value.error {
  color: #ef4444;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-container {
    gap: 20px;
  }
  
  .input-output-section {
    padding: 16px;
  }
  
  .button-group {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .example-buttons {
    align-self: flex-end;
  }
}
</style>
