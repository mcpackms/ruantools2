import { useState, useEffect } from 'react';

const CRON_INFO = {
  '每分钟': { second: '*', minute: '*', hour: '*', day: '*', month: '*', weekday: '*' },
  '每小时': { second: '0', minute: '*', hour: '*', day: '*', month: '*', weekday: '*' },
  '每天凌晨': { second: '0', minute: '0', hour: '0', day: '*', month: '*', weekday: '*' },
  '每周一': { second: '0', minute: '0', hour: '0', day: '*', month: '*', weekday: '1' },
  '每月1号': { second: '0', minute: '0', hour: '0', day: '1', month: '*', weekday: '*' }
};

export default function CronGenerator() {
  const [cron, setCron] = useState('0 0 * * *');
  const [second, setSecond] = useState('0');
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [description, setDescription] = useState('每天凌晨 0:00 执行');

  useEffect(() => {
    const newCron = `${second} ${minute} ${hour} ${day} ${month} ${weekday}`;
    setCron(newCron);
    setDescription(generateDescription(second, minute, hour, day, month, weekday));
  }, [second, minute, hour, day, month, weekday]);

  const generateDescription = (sec, min, hr, d, mon, wd) => {
    let desc = '';
    
    if (sec !== '*') desc += `第 ${sec}秒 `;
    if (min === '*') desc += '每分钟 ';
    else if (min.includes(',')) desc += `在 ${min}分 `;
    else if (min.includes('-')) desc += `从 ${min.replace('-', ' 到 ')}分 `;
    else if (min.includes('/')) desc += `每 ${min.split('/')[1]}分钟 `;
    else desc += `在 ${min}分 `;
    
    if (hr === '*') desc += '每小时 ';
    else if (hr.includes(',')) desc += `在 ${hr}点 `;
    else if (hr.includes('-')) desc += `从 ${hr.replace('-', ' 到 ')}点 `;
    else if (hr.includes('/')) desc += `每 ${hr.split('/')[1]}小时 `;
    else desc += `在 ${hr}点 `;
    
    if (d === '*') desc += '每天 ';
    else if (d.includes(',')) desc += `在 ${d}号 `;
    else if (d.includes('-')) desc += `${d.replace('-', ' 到 ')}号 `;
    else desc += `每月 ${d}号 `;
    
    if (mon === '*') desc += '每月 ';
    else desc += `${mon}月 `;
    
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    if (wd === '*') desc += '每天';
    else if (wd.includes(',')) desc += `在${wd.split(',').map(w => weekNames[parseInt(w)]).join('、')} `;
    else desc += `在${weekNames[parseInt(wd)]}`;
    
    return desc.trim() || '自定义 cron 表达式';
  };

  const applyPreset = (name) => {
    const preset = CRON_INFO[name];
    setSecond(preset.second);
    setMinute(preset.minute);
    setHour(preset.hour);
    setDay(preset.day);
    setMonth(preset.month);
    setWeekday(preset.weekday);
  };

  const copyCron = () => {
    navigator.clipboard.writeText(cron);
  };

  const fields = [
    { label: '秒', value: second, setValue: setSecond, min: 0, max: 59 },
    { label: '分钟', value: minute, setValue: setMinute, min: 0, max: 59 },
    { label: '小时', value: hour, setValue: setHour, min: 0, max: 23 },
    { label: '日期', value: day, setValue: setDay, min: 1, max: 31 },
    { label: '月份', value: month, setValue: setMonth, min: 1, max: 12 },
    { label: '星期', value: weekday, setValue: setWeekday, min: 0, max: 6 }
  ];

  return (
    <div className="cron-generator">
      <style>{`
        .cron-generator {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
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
        .presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          justify-content: center;
        }
        .preset-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .cron-display {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          text-align: center;
        }
        .cron-value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 1.75rem;
          color: #60a5fa;
          margin-bottom: 12px;
          letter-spacing: 4px;
        }
        .cron-desc {
          color: #94a3b8;
          font-size: 1rem;
        }
        .copy-btn {
          margin-top: 16px;
          padding: 8px 20px;
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .field-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .field-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
        }
        .field-hint {
          font-weight: 400;
          color: #94a3b8;
        }
        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.95rem;
        }
        .field-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .quick-values {
          display: flex;
          gap: 6px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .quick-btn {
          padding: 4px 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #64748b;
          cursor: pointer;
        }
        .quick-btn:hover {
          background: #e2e8f0;
        }
        .help-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
        }
        .help-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .help-table {
          width: 100%;
          font-size: 0.8rem;
        }
        .help-table th, .help-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .help-table th {
          color: #64748b;
        }
        .help-table td {
          font-family: monospace;
          color: #1e293b;
        }
      `}</style>

      <div className="header">
        <h1>Cron 表达式</h1>
        <p>在线生成和解析 Cron 表达式，可视化配置</p>
      </div>

      <div className="presets">
        {Object.keys(CRON_INFO).map(name => (
          <button key={name} className="preset-btn" onClick={() => applyPreset(name)}>
            {name}
          </button>
        ))}
      </div>

      <div className="cron-display">
        <div className="cron-value">{cron}</div>
        <div className="cron-desc">{description}</div>
        <button className="copy-btn" onClick={copyCron}>
          复制表达式
        </button>
      </div>

      <div className="fields-grid">
        {fields.map((field, index) => (
          <div key={field.label} className="field-card">
            <div className="field-label">
              <span>{field.label}</span>
              <span className="field-hint">{field.min}-{field.max}</span>
            </div>
            <input
              type="text"
              className="field-input"
              value={field.value}
              onChange={(e) => field.setValue(e.target.value)}
            />
            <div className="quick-values">
              <button className="quick-btn" onClick={() => field.setValue('*')}>每</button>
              <button className="quick-btn" onClick={() => field.setValue(field.min.toString())}>{field.min}</button>
              <button className="quick-btn" onClick={() => field.setValue(`${field.min}-${field.max}`)}>范围</button>
              <button className="quick-btn" onClick={() => field.setValue(`*/${Math.ceil((field.max - field.min + 1) / 4)}`)}>间隔</button>
            </div>
          </div>
        ))}
      </div>

      <div className="help-card">
        <div className="help-title">Cron 表达式语法说明</div>
        <table className="help-table">
          <thead>
            <tr>
              <th>字段</th>
              <th>允许值</th>
              <th>特殊字符</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>秒</td><td>0-59</td><td>* , - /</td></tr>
            <tr><td>分钟</td><td>0-59</td><td>* , - /</td></tr>
            <tr><td>小时</td><td>0-23</td><td>* , - /</td></tr>
            <tr><td>日期</td><td>1-31</td><td>* , - / ? L W</td></tr>
            <tr><td>月份</td><td>1-12</td><td>* , - /</td></tr>
            <tr><td>星期</td><td>0-6</td><td>* , - / ? L #</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
