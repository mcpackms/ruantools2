import { useState, useEffect } from 'react';

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [hsv, setHsv] = useState({ h: 217, s: 76, l: 96 });
  const [activeInput, setActiveInput] = useState('hex');

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const hsvToRgb = (h, s, v) => {
    h /= 360; s /= 100; v /= 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  useEffect(() => {
    if (activeInput === 'hex') {
      const rgbVal = hexToRgb(hex);
      if (rgbVal) {
        setRgb(rgbVal);
        const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
        const hsvVal = rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b);
        setHsl(hslVal);
        setHsv(hsvVal);
      }
    } else if (activeInput === 'rgb') {
      const hexVal = rgbToHex(rgb.r, rgb.g, rgb.b);
      const hslVal = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHex(hexVal);
      setHsl(hslVal);
      setHsv(hsvVal);
    }
  }, [activeInput, hex, rgb]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="color-converter">
      <style>{`
        .color-converter {
          max-width: 800px;
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
        .preview-box {
          width: 100%;
          height: 120px;
          border-radius: 16px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: background-color 0.2s;
        }
        .formats-grid {
          display: grid;
          gap: 16px;
        }
        .format-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .format-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .format-value {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .format-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .format-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .copy-btn {
          padding: 8px 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #64748b;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        .slider-group {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .slider-item {
          flex: 1;
        }
        .slider-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }
        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          -webkit-appearance: none;
          background: #e2e8f0;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
      `}</style>

      <div className="header">
        <h1>颜色转换器</h1>
        <p>在线转换 HEX、RGB、HSL、HSV 颜色格式</p>
      </div>

      <div className="preview-box" style={{ backgroundColor: hex }}></div>

      <div className="formats-grid">
        <div className="format-card">
          <div className="format-label">
            <span>HEX</span>
          </div>
          <div className="format-value">
            <input
              type="text"
              className="format-input"
              value={hex}
              onChange={(e) => { setHex(e.target.value); setActiveInput('hex'); }}
              placeholder="#000000"
            />
            <button className="copy-btn" onClick={() => copyToClipboard(hex)}>复制</button>
          </div>
        </div>

        <div className="format-card">
          <div className="format-label">
            <span>RGB</span>
          </div>
          <div className="format-value">
            <input
              type="number"
              className="format-input"
              value={rgb.r}
              onChange={(e) => { setRgb({...rgb, r: parseInt(e.target.value) || 0}); setActiveInput('rgb'); }}
              min="0" max="255"
              placeholder="R"
            />
            <input
              type="number"
              className="format-input"
              value={rgb.g}
              onChange={(e) => { setRgb({...rgb, g: parseInt(e.target.value) || 0}); setActiveInput('rgb'); }}
              min="0" max="255"
              placeholder="G"
            />
            <input
              type="number"
              className="format-input"
              value={rgb.b}
              onChange={(e) => { setRgb({...rgb, b: parseInt(e.target.value) || 0}); setActiveInput('rgb'); }}
              min="0" max="255"
              placeholder="B"
            />
            <button className="copy-btn" onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>复制</button>
          </div>
        </div>

        <div className="format-card">
          <div className="format-label">
            <span>HSL</span>
          </div>
            <div className="slider-group">
            <div className="slider-item">
              <div className="slider-label"><span>H</span><span>{hsl.h}°</span></div>
              <input type="range" className="slider" min="0" max="360" value={hsl.h} onChange={(e) => {
                const newHsl = {...hsl, h: parseInt(e.target.value)};
                setHsl(newHsl);
                const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                setRgb(rgbVal);
                setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
                setHsv(rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b));
              }} />
            </div>
            <div className="slider-item">
              <div className="slider-label"><span>S</span><span>{hsl.s}%</span></div>
              <input type="range" className="slider" min="0" max="100" value={hsl.s} onChange={(e) => {
                const newHsl = {...hsl, s: parseInt(e.target.value)};
                setHsl(newHsl);
                const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                setRgb(rgbVal);
                setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
                setHsv(rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b));
              }} />
            </div>
            <div className="slider-item">
              <div className="slider-label"><span>L</span><span>{hsl.l}%</span></div>
              <input type="range" className="slider" min="0" max="100" value={hsl.l} onChange={(e) => {
                const newHsl = {...hsl, l: parseInt(e.target.value)};
                setHsl(newHsl);
                const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                setRgb(rgbVal);
                setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
                setHsv(rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b));
              }} />
            </div>
          </div>
          <div className="format-value" style={{ marginTop: '12px' }}>
            <input type="text" className="format-input" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} readOnly />
            <button className="copy-btn" onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>复制</button>
          </div>
        </div>

        <div className="format-card">
          <div className="format-label">
            <span>HSV / HSB</span>
          </div>
          <div className="format-value">
            <input type="text" className="format-input" value={`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`} readOnly />
            <button className="copy-btn" onClick={() => copyToClipboard(`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`)}>复制</button>
          </div>
        </div>
      </div>
    </div>
  );
}
