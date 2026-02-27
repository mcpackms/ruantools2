import { tools } from '../data/tools';

export default function ToolList() {
  const availableTools = tools.filter(t => !t.comingSoon);
  const upcomingTools = tools.filter(t => t.comingSoon);

  const handleComingSoonClick = () => {
    alert('该工具正在开发中，即将上线！');
  };

  return (
    <div>
      <section className="tools-section">
        <h2 className="section-title">可用工具</h2>
        <div className="tools-grid">
          {availableTools.map(tool => (
            <a
              key={tool.id}
              href={tool.path}
              className="tool-item"
            >
              <div className="tool-header">
                <h3 className="tool-name">{tool.name}</h3>
                <span className="tool-category">{tool.category}</span>
              </div>
              <p className="tool-description">{tool.description}</p>
              <div className="tool-status">
                <span className="tool-link">立即使用 →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {upcomingTools.length > 0 && (
        <section className="tools-section">
          <h2 className="section-title">即将上线</h2>
          <div className="tools-grid">
            {upcomingTools.map(tool => (
              <div
                key={tool.id}
                className="tool-item coming-soon"
                onClick={handleComingSoonClick}
              >
                <div className="tool-header">
                  <h3 className="tool-name">{tool.name}</h3>
                  <span className="tool-category">{tool.category}</span>
                </div>
                <p className="tool-description">{tool.description}</p>
                <div className="tool-status">
                  <span className="coming-soon-badge">开发中</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
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
      `}</style>
    </div>
  );
}
