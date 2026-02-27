import { useState, useEffect } from 'react';

export default function MarkdownPreview() {
  const [input, setInput] = useState('# 标题\n\n开始编写 Markdown...');
  const [output, setOutput] = useState('');

  const parseMarkdown = (text) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/~~(.*)~~/gim, '<del>$1</del>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;" />')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\n/gim, '<br />');

    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    html = html.replace(/<br \/><li>/g, '<li>');
    html = html.replace(/<\/li><br \/>/g, '</li>');

    return html;
  };

  useEffect(() => {
    setOutput(parseMarkdown(input));
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="markdown-preview">
      <style>{`
        .markdown-preview {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .header p {
          color: #64748b;
          font-size: 0.9rem;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .toolbar-hint {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          min-height: 500px;
        }
        @media (max-width: 768px) {
          .editor-grid {
            grid-template-columns: 1fr;
          }
        }
        .editor-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .editor-header {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
        }
        .markdown-input {
          flex: 1;
          min-height: 450px;
          padding: 16px;
          border: none;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          resize: none;
        }
        .markdown-input:focus {
          outline: none;
        }
        .preview-output {
          flex: 1;
          min-height: 450px;
          padding: 16px;
          overflow-y: auto;
          line-height: 1.7;
        }
        .preview-output h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        .preview-output h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 24px 0 12px;
          color: #1e293b;
        }
        .preview-output h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 20px 0 10px;
          color: #1e293b;
        }
        .preview-output p {
          margin: 0 0 12px;
          color: #334155;
        }
        .preview-output strong {
          font-weight: 600;
        }
        .preview-output em {
          font-style: italic;
        }
        .preview-output del {
          text-decoration: line-through;
          color: #64748b;
        }
        .preview-output code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85em;
          color: #e11d48;
        }
        .preview-output pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 12px 0;
        }
        .preview-output pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
        .preview-output ul {
          margin: 12px 0;
          padding-left: 24px;
        }
        .preview-output li {
          margin: 4px 0;
        }
        .preview-output blockquote {
          border-left: 4px solid #3b82f6;
          margin: 12px 0;
          padding: 8px 16px;
          background: #f8fafc;
          color: #64748b;
        }
        .preview-output a {
          color: #3b82f6;
          text-decoration: none;
        }
        .preview-output a:hover {
          text-decoration: underline;
        }
        .preview-output img {
          max-width: 100%;
          border-radius: 8px;
        }
      `}</style>

      <div className="header">
        <h1>Markdown 预览</h1>
        <p>在线编辑和预览 Markdown，支持实时转换</p>
      </div>

      <div className="toolbar">
        <span className="toolbar-hint">支持标题、粗体、斜体、代码、链接、列表等语法</span>
        <button className="btn" onClick={copyHtml}>
          复制 HTML
        </button>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <div className="editor-header">Markdown</div>
          <textarea
            className="markdown-input"
            value={input}
            onChange={handleInputChange}
            placeholder="在此输入 Markdown..."
          />
        </div>
        <div className="editor-panel">
          <div className="editor-header">预览</div>
          <div
            className="preview-output"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      </div>
    </div>
  );
}
