import React, { useRef, useEffect, useState } from 'react';
import base64Fonts from './base64_fonts.json';

const svgToBase64 = (svgString) => {
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString.trim())))}`;
  } catch (e) {
    console.error('Failed to convert SVG to base64', e);
    return '';
  }
};

const topLeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
  <defs>
    <linearGradient id="tlGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b026ff" stop-opacity="1.0" />
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="tlGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5b46e8" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#c084fc" stop-opacity="0.0" />
    </linearGradient>
  </defs>
  <polygon points="0,0 320,0 220,90 0,160" fill="url(#tlGrad1)" />
  <polygon points="0,0 210,0 120,60 0,105" fill="url(#tlGrad2)" />
  <polygon points="0,0 110,0 0,65" fill="#b026ff" opacity="0.4" />
</svg>
`;

const topRightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">
  <defs>
    <linearGradient id="trGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="1.0" />
      <stop offset="100%" stop-color="#5b46e8" stop-opacity="0.3" />
    </linearGradient>
  </defs>
  <polygon points="250,0 250,220 150,110 50,0" fill="url(#trGrad1)" />
  <polygon points="250,0 250,110 130,0" fill="#5b46e8" opacity="0.55" />
</svg>
`;

const bottomLeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 200">
  <defs>
    <linearGradient id="blGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#b026ff" stop-opacity="0.25" />
    </linearGradient>
  </defs>
  <polygon points="0,200 240,200 130,110 0,90" fill="url(#blGrad1)" />
  <polygon points="0,200 120,200 0,115" fill="#3b82f6" opacity="0.5" />
</svg>
`;

const bottomRightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 220">
  <defs>
    <linearGradient id="brGrad1" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="1.0" />
      <stop offset="40%" stop-color="#3b82f6" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#5b46e8" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="brGrad2" x1="100%" y1="100%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00bcd4" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
    </linearGradient>
  </defs>
  <polygon points="340,220 340,40 180,120 70,220" fill="url(#brGrad1)" />
  <polygon points="340,220 340,110 210,220" fill="url(#brGrad2)" />
  <polygon points="340,220 220,220 340,140" fill="#06b6d4" opacity="0.45" />
</svg>
`;

const sealSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115">
  <defs>
    <linearGradient id="seal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b026ff" />
      <stop offset="50%" stop-color="#5b46e8" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <path d="M 38 65 L 26 108 L 46 98 L 50 72 Z" fill="#5b46e8" />
  <path d="M 62 65 L 74 108 L 54 98 L 50 72 Z" fill="#3b82f6" />
  <path d="M 50 5 L 53 14 L 62 10 L 63 20 L 72 17 L 71 27 L 80 26 L 77 35 L 85 36 L 80 44 L 87 47 L 80 53 L 85 61 L 77 65 L 80 74 L 71 73 L 72 83 L 63 80 L 62 90 L 53 86 L 50 95 L 47 86 L 38 90 L 37 80 L 28 83 L 29 73 L 20 74 L 23 65 L 15 61 L 20 53 L 13 47 L 20 44 L 15 36 L 23 35 L 20 26 L 29 27 L 28 17 L 37 20 L 38 10 L 47 14 Z" fill="url(#seal-gradient)" />
  <circle cx="50" cy="50" r="30" fill="#ffffff" />
  <circle cx="50" cy="50" r="27" fill="none" stroke="url(#seal-gradient)" stroke-width="1.2" stroke-dasharray="3 2" />
  <path d="M 50 35 L 68 43 L 50 51 L 32 43 Z" fill="url(#seal-gradient)" />
  <path d="M 38 46 L 38 57 C 38 61, 62 61, 62 57 L 62 46" fill="none" stroke="url(#seal-gradient)" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 57 46 L 68 52 L 68 58" fill="none" stroke="url(#seal-gradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="68" cy="59" r="1.5" fill="url(#seal-gradient)" />
</svg>
`;

// Dynamically generate inline @font-face rules using base64 fonts to avoid cross-origin canvas bugs.
const fontFaceRules = base64Fonts.map(font => `
  @font-face {
    font-family: '${font.family}';
    font-style: normal;
    font-weight: ${font.weight};
    src: url(data:font/woff2;base64,${font.base64}) format('woff2');
  }
`).join('\n');

export default function CertificateCard({ studentName, examName, certificateId, issueDate, description, isPrinting }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isPrinting) return;

    const handleResize = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      
      const parentWidth = parent.clientWidth;
      const targetWidth = 1000;
      const newScale = Math.min(parentWidth / targetWidth, 1);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current && containerRef.current.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [isPrinting]);

  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const certDesc = description || `For successfully completing the exam assessment "${examName}" on Mentara Labs and demonstrating outstanding commitment to academic excellence.`;
  const logoUrl = window.location.origin + '/mentara-new.png';

  return (
    <div 
      ref={containerRef} 
      className="certificate-card-wrapper"
      style={{
        width: '1000px',
        height: '707px',
        transform: isPrinting ? 'none' : `scale(${scale})`,
        transformOrigin: 'top left',
        marginBottom: isPrinting ? '0px' : `${(scale - 1) * 707}px`,
        marginRight: isPrinting ? '0px' : `${(scale - 1) * 1000}px`,
        display: 'inline-block'
      }}
    >
      <div className="certificate-wrapper" style={{ width: '1000px', height: '707px' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          ${fontFaceRules}

          .cert-container {
            width: 1000px;
            height: 707px;
            background: linear-gradient(135deg, #ffffff 60%, #f1f5f9 100%);
            color: #1e1b4b;
            position: relative;
            padding: 45px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-radius: 12px;
            font-family: 'Montserrat', sans-serif;
            border: 1px solid rgba(0, 0, 0, 0.05);
          }
          .cert-double-border {
            position: absolute;
            top: 25px;
            left: 25px;
            right: 25px;
            bottom: 25px;
            border: 2px solid rgba(79, 70, 229, 0.45);
            pointer-events: none;
            z-index: 2;
          }
          .cert-double-border::after {
            content: '';
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 1.5px dashed rgba(79, 70, 229, 0.55);
          }
          .cert-corner {
            position: absolute;
            pointer-events: none;
            z-index: 1;
            object-fit: contain;
          }
          .cert-corner.top-left { top: 0; left: 0; width: 320px; height: 220px; }
          .cert-corner.top-right { top: 0; right: 0; width: 250px; height: 250px; }
          .cert-corner.bottom-left { bottom: 0; left: 0; width: 280px; height: 200px; }
          .cert-corner.bottom-right { bottom: 0; right: 0; width: 340px; height: 220px; }
          
          .cert-header {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            z-index: 3;
          }
          .cert-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            margin-top: 15px;
          }
          .cert-logo {
            height: 64px;
            width: auto;
            object-fit: contain;
          }
          .cert-brand-name {
            font-size: 1.15rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            background: linear-gradient(135deg, #b026ff 0%, #5b46e8 35%, #3b82f6 70%, #06b6d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-top: 4px;
          }
          
          .cert-body {
            display: grid;
            grid-template-columns: 1fr 220px;
            gap: 30px;
            align-items: center;
            justify-content: space-between;
            flex-grow: 1;
            padding: 0 40px 0 55px;
            z-index: 3;
            margin-top: 15px;
          }
          .cert-text-column {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
          .cert-seal-column {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
          }
          .cert-title-container {
            margin-bottom: 6px;
          }
          .cert-title-text {
            font-family: 'Cinzel', serif;
            font-size: 2rem;
            font-weight: 800;
            color: #1e1b4b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.3;
          }
          .cert-subtitle-text {
            font-size: 0.9rem;
            font-style: italic;
            color: #4f46e5;
            margin-top: 4px;
            margin-bottom: 10px;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .cert-recipient-name {
            font-size: 2.6rem;
            font-weight: 800;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            border-bottom: 3.5px solid #4f46e5;
            padding-bottom: 4px;
            display: inline-block;
            min-width: 320px;
            margin-bottom: 16px;
            line-height: 1.1;
          }
          .cert-desc-text {
            font-size: 0.8rem;
            line-height: 1.7;
            color: #374151;
            max-width: 520px;
            font-weight: 500;
          }
          
          .cert-seal-wrapper {
            position: relative;
            width: 140px;
            height: 140px;
            margin-top: -10px;
            z-index: 5;
            filter: drop-shadow(1px 3px 3px rgba(30, 27, 75, 0.18));
          }
          .cert-seal-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 60px 10px 60px;
            z-index: 3;
          }
          .cert-footer-block {
            text-align: center;
            width: 180px;
          }
          .cert-footer-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: #1e1b4b;
            min-height: 32px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 6px;
          }
          .cert-footer-line {
            height: 1.5px;
            background-color: rgba(99, 102, 241, 0.3);
            width: 100%;
            margin-bottom: 6px;
          }
          .cert-footer-label {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #64748b;
          }
        `}} />
        
        <div className="cert-container">
          <div className="cert-double-border"></div>
          
          {/* Top Left Corner */}
          <img className="cert-corner top-left" src={svgToBase64(topLeftSvg)} alt="" />

          {/* Top Right Corner */}
          <img className="cert-corner top-right" src={svgToBase64(topRightSvg)} alt="" />

          {/* Bottom Left Corner */}
          <img className="cert-corner bottom-left" src={svgToBase64(bottomLeftSvg)} alt="" />

          {/* Bottom Right Corner */}
          <img className="cert-corner bottom-right" src={svgToBase64(bottomRightSvg)} alt="" />

          <header className="cert-header">
            <div className="cert-brand">
              <img className="cert-logo" src={logoUrl} alt="Mentara Labs Logo" />
              <span className="cert-brand-name">Mentara Labs</span>
            </div>
          </header>

          <div className="cert-body">
            <div className="cert-text-column">
              <div className="cert-title-container">
                <h1 className="cert-title-text font-serif">Certificate of Completion</h1>
              </div>
              <p className="cert-subtitle-text">This is proudly presented to</p>
              <div className="cert-recipient-name">{studentName}</div>
              <p className="cert-desc-text">{certDesc}</p>
            </div>

            <div className="cert-seal-column">
              <div className="cert-seal-wrapper">
                <img className="cert-seal-image" src={svgToBase64(sealSvg)} alt="Graduation Seal" />
              </div>
            </div>
          </div>

          <footer className="cert-footer">
            <div className="cert-footer-block">
              <div className="cert-footer-value">{formattedDate}</div>
              <div className="cert-footer-line"></div>
              <div className="cert-footer-label">Date</div>
            </div>
            
            <div className="cert-footer-block">
              <div className="cert-footer-value" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '800', fontSize: '0.85rem', color: '#4f46e5', letterSpacing: '0.02em' }}>
                {certificateId}
              </div>
              <div className="cert-footer-line"></div>
              <div className="cert-footer-label">Certificate ID</div>
            </div>

            <div className="cert-footer-block">
              <div className="cert-footer-value" style={{ fontFamily: 'Cinzel, serif', fontStyle: 'italic', paddingBottom: '8px', color: '#1e1b4b', fontWeight: 'bold' }}>
                Mentara Labs
              </div>
              <div className="cert-footer-line"></div>
              <div className="cert-footer-label">Authorized Signatory</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
