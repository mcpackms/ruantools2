import { useState, useMemo } from 'react';
import { tools, categoryConfig } from '../data/tools';

export default function ToolList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const availableTools = tools.filter(t => !t.comingSoon);
  const upcomingTools = tools.filter(t => t.comingSoon);

  const categories = ['全部', ...Object.keys(categoryConfig)];

  const filteredTools = useMemo(() => {
    let result = availableTools;
    
    if (selectedCategory !== '全部') {
      result = result.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [searchQuery, selectedCategory]);

  const groupedTools = filteredTools.reduce((acc, tool) => {
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

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('全部');
  };

  return (
    <div className="tool-list">
      <div className="search-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="搜索工具名称或功能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={clearSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === '全部' ? '🏠' : categoryConfig[cat]?.icon} {cat}
            </button>
          ))}
        </div>
        
        {searchQuery && (
          <div className="search-results-info">
            找到 <strong>{filteredTools.length}</strong> 个工具
            {selectedCategory !== '全部' && `（${selectedCategory}）`}
          </div>
        )}
      </div>

      {Object.keys(groupedTools).length > 0 ? (
        Object.entries(groupedTools).map(([category, categoryTools]) => {
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
        })
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">未找到相关工具</div>
          <div className="empty-text">试试其他关键词或分类</div>
          <button className="clear-search-btn" onClick={clearSearch}>
            清除筛选条件
          </button>
        </div>
      )}

      {upcomingTools.length > 0 && !searchQuery && selectedCategory === '全部' && (
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
        .search-section {
          margin-bottom: 32px;
        }
        
        .search-box {
          position: relative;
          margin-bottom: 20px;
        }
        
        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #94a3b8;
        }
        
        .search-input {
          width: 100%;
          padding: 16px 50px 16px 52px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .clear-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: none;
          background: #f1f5f9;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .clear-btn svg {
          width: 14px;
          height: 14px;
          color: #64748b;
        }
        
        .clear-btn:hover {
          background: #e2e8f0;
        }
        
        .category-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        
        .category-tab {
          padding: 10px 18px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: white;
          font-size: 0.9rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .category-tab:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .category-tab.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: #3b82f6;
          color: white;
        }
        
        .search-results-info {
          font-size: 0.9rem;
          color: #64748b;
          padding: 12px 16px;
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .search-results-info strong {
          color: #3b82f6;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        
        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .empty-text {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 20px;
        }
        
        .clear-search-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .clear-search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

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
