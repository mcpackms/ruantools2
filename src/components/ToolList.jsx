import { tools, categoryConfig } from '../data/tools';

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

  const getCategoryConfig = (category) => {
    return categoryConfig[category] || categoryConfig['其他'];
  };

  return (
    <div className="tool-list">
      {Object.entries(groupedTools).map(([category, categoryTools]) => {
        const config = getCategoryConfig(category);
        return (
          <section key={category} className="category-section">
            <div className="category-header">
              <span className="category-icon">{config.icon}</span>
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
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-top">
                      <h3 className="tool-name">{tool.name}</h3>
                      <span 
                        className="tool-category"
                        style={{ 
                          background: config.bg,
                          color: config.color
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
        );
      })}

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
        .tool-list {
          padding: 20px 0;
        }

        .category-section {
          margin-bottom: 56px;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--border-color);
        }

        .category-icon {
          font-size: 1.75rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
          border-radius: 14px;
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .category-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          flex: 1;
          letter-spacing: -0.02em;
        }

        .category-count {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          background: white;
          padding: 6px 14px;
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }
        }

        .tool-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
          position: relative;
          overflow: hidden;
        }

        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .tool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary) 0%, #8b5cf6 50%, #06b6d4 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }

        .tool-card:hover {
          border-color: transparent;
          box-shadow: var(--shadow-lg);
          transform: translateY(-6px);
        }

        .tool-card:hover .card-glow {
          opacity: 1;
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
          position: relative;
          z-index: 1;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
          gap: 14px;
        }

        .tool-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .tool-category {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tool-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          position: relative;
          z-index: 1;
        }

        .use-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--primary);
          transition: all 0.25s ease;
        }

        .tool-card:hover .use-btn {
          gap: 14px;
        }

        .arrow-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.25s ease;
        }

        .tool-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        .coming-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-tertiary);
        }

        .clock-icon {
          width: 18px;
          height: 18px;
        }

        .coming-soon-section {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
