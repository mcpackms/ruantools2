import { tools } from '../data/tools';

const categoryIcons = {
  '数据格式': '⚡',
  '编码转换': '🔄',
  '时间工具': '⏰',
  '加密工具': '🔐',
  '文本处理': '📝',
  '软件下载': '📦',
  '图片工具': '🖼️'
};

const categoryColors = {
  '数据格式': { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
  '编码转换': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  '时间工具': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
  '加密工具': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  '文本处理': { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
  '软件下载': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  '图片工具': { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }
};

export default function ToolList() {
  const availableTools = tools.filter(t => !t.comingSoon);
  const upcomingTools = tools.filter(t => t.comingSoon);

  const groupedTools = availableTools.reduce((acc, tool) => {
    const cat = tool.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  const handleComingSoonClick = () => {
    alert('该工具正在开发中，即将上线！');
  };

  return (
    <div className="tool-list">
      {Object.entries(groupedTools).map(([category, categoryTools]) => (
        <section key={category} className="category-section">
          <div className="category-header">
            <span className="category-icon">{categoryIcons[category] || '📌'}</span>
            <h2 className="category-title">{category}</h2>
            <span className="category-count">{categoryTools.length} 个工具</span>
          </div>
          <div className="tools-grid">
            {categoryTools.map(tool => (
              <a
                key={tool.id}
                href={tool.path}
                className="tool-card"
              >
                <div className="card-content">
                  <div className="card-top">
                    <h3 className="tool-name">{tool.name}</h3>
                    <span 
                      className="tool-category"
                      style={{ 
                        background: categoryColors[category]?.bg || 'rgba(107, 114, 128, 0.1)',
                        color: categoryColors[category]?.color || '#6b7280'
                      }}
                    >
                      {category}
                    </span>
                  </div>
                  <p className="tool-description">{tool.description}</p>
                </div>
                <div className="card-footer">
                  <span className="use-btn">
                    立即使用
                    <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}

      {upcomingTools.length > 0 && (
        <section className="category-section coming-soon-section">
          <div className="category-header">
            <span className="category-icon">🚀</span>
            <h2 className="category-title">即将上线</h2>
            <span className="category-count">{upcomingTools.length} 个工具</span>
          </div>
          <div className="tools-grid">
            {upcomingTools.map(tool => (
              <div
                key={tool.id}
                className="tool-card coming-soon"
                onClick={handleComingSoonClick}
              >
                <div className="card-content">
                  <div className="card-top">
                    <h3 className="tool-name">{tool.name}</h3>
                    <span className="tool-category">开发中</span>
                  </div>
                  <p className="tool-description">{tool.description}</p>
                </div>
                <div className="card-footer">
                  <span className="coming-badge">
                    <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    敬请期待
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @media (prefers-color-scheme: dark) {
          .tool-card {
            background: var(--surface-color) !important;
            border-color: var(--border-color) !important;
          }
          .tool-name {
            color: var(--text-primary) !important;
          }
          .tool-description {
            color: var(--text-secondary) !important;
          }
          .card-footer {
            border-color: var(--border-color) !important;
          }
          .category-header {
            border-color: var(--border-color) !important;
          }
          .category-title {
            color: var(--text-primary) !important;
          }
          .category-count {
            background: var(--surface-color) !important;
          }
        }

        .tool-list {
          padding: 20px 0;
        }

        .category-section {
          margin-bottom: 50px;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .category-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: 10px;
          color: white;
        }

        .category-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          flex: 1;
        }

        .category-count {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          background: var(--surface-color);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }
        }

        .tool-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
          position: relative;
          overflow: hidden;
        }

        .tool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .tool-card:hover {
          border-color: transparent;
          box-shadow: 0 10px 40px -10px rgba(37, 99, 235, 0.25);
          transform: translateY(-4px);
        }

        .tool-card:hover::before {
          transform: scaleX(1);
        }

        .tool-card.coming-soon {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .tool-card.coming-soon:hover {
          transform: none;
          box-shadow: none;
        }

        .tool-card.coming-soon::before {
          display: none;
        }

        .card-content {
          flex: 1;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .tool-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .tool-category {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tool-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .use-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--primary);
          transition: all 0.2s ease;
        }

        .tool-card:hover .use-btn {
          gap: 10px;
        }

        .arrow-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .tool-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        .coming-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .clock-icon {
          width: 16px;
          height: 16px;
        }

        .coming-soon-section {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
