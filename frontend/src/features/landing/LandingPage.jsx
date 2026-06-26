import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function LandingPage() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  // Redirect already-authenticated users
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/courses', { replace: true });
    }
  }, [user, navigate]);

  // Scroll-reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const siblings = [...e.target.parentElement.querySelectorAll('.reveal')];
          const idx      = siblings.indexOf(e.target);
          e.target.style.transitionDelay = idx * 0.07 + 's';
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  // Bento cursor glow
  useEffect(() => {
    const cards = document.querySelectorAll('.bento-card');
    const onMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      e.currentTarget.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(124,58,237,0.12) 0%, rgba(255,255,255,0.04) 60%)`;
    };
    const onLeave = (e) => { e.currentTarget.style.background = ''; };
    cards.forEach((c) => { c.addEventListener('mousemove', onMove); c.addEventListener('mouseleave', onLeave); });
    return () => cards.forEach((c) => { c.removeEventListener('mousemove', onMove); c.removeEventListener('mouseleave', onLeave); });
  }, []);

  // Nav scroll tint
  useEffect(() => {
    const nav = document.getElementById('main-nav');
    const onScroll = () => {
      if (nav) nav.style.background = window.scrollY > 40
        ? 'rgba(10,14,26,0.95)'
        : 'rgba(10,14,26,0.8)';
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        .lp-root {
          --navy:        #0A0E1A;
          --navy2:       #0F1629;
          --violet:      #7C3AED;
          --violet-l:    #9D6FEF;
          --cyan:        #00D4FF;
          --cream:       #F5F0E8;
          --lavender:    #C4B5FD;
          --card-bg:     rgba(255,255,255,0.04);
          --card-border: rgba(255,255,255,0.08);
          background: var(--navy);
          color: var(--cream);
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          line-height: 1.6;
        }
        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── NAV ── */
        #main-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 1.2rem 5%;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(20px);
          background: rgba(10,14,26,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.3s;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.35rem; font-weight: 700;
          text-decoration: none;
        }
        .nav-logo-text {
          background: linear-gradient(135deg, var(--cyan), var(--violet-l));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          letter-spacing: -0.02em;
        }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { color: rgba(245,240,232,0.6); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--cream); }
        .nav-cta {
          background: linear-gradient(135deg, var(--violet), #5B21B6);
          color: #fff; border: none; padding: 0.6rem 1.4rem;
          border-radius: 50px; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; font-family: 'Space Grotesk', sans-serif;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(124,58,237,0.4);
          text-decoration: none; display: inline-block;
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 0 32px rgba(124,58,237,0.6); }

        /* ── BLOBS ── */
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .blob-1 { width:600px;height:600px;background:radial-gradient(circle,rgba(124,58,237,0.25)0%,transparent 70%);top:-100px;left:-100px;animation:drift1 12s ease-in-out infinite alternate; }
        .blob-2 { width:500px;height:500px;background:radial-gradient(circle,rgba(0,212,255,0.2)0%,transparent 70%);bottom:-80px;right:-80px;animation:drift2 15s ease-in-out infinite alternate; }
        .blob-3 { width:300px;height:300px;background:radial-gradient(circle,rgba(196,181,253,0.15)0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);animation:pulse-blob 8s ease-in-out infinite; }
        @keyframes drift1 { from{transform:translate(0,0)} to{transform:translate(60px,40px)} }
        @keyframes drift2 { from{transform:translate(0,0)} to{transform:translate(-50px,-30px)} }
        @keyframes pulse-blob { 0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.3)} }

        /* ── HERO ── */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; padding: 8rem 5% 4rem;
        }
        .hero-content {
          position: relative; z-index: 2;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4rem; align-items: center; max-width: 1200px; width: 100%;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
          padding: 0.35rem 1rem; border-radius: 50px;
          font-size: 0.8rem; font-weight: 600; color: var(--lavender);
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.5rem;
          animation: fade-up 0.8s ease both;
        }
        .eyebrow-dot { width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan);animation:blink 2s ease infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.8rem,5vw,4.2rem); font-weight: 700;
          line-height: 1.1; letter-spacing: -0.03em;
          animation: fade-up 0.8s 0.1s ease both;
        }
        .headline-gradient {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--lavender) 50%, var(--violet-l) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub { margin-top:1.2rem;color:rgba(245,240,232,0.6);font-size:1.05rem;max-width:480px;line-height:1.75;animation:fade-up 0.8s 0.2s ease both; }
        .hero-actions { display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap;animation:fade-up 0.8s 0.3s ease both; }
        .hero-stats { display:flex;gap:2rem;margin-top:2.5rem;animation:fade-up 0.8s 0.4s ease both; }
        .stat-num { font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;background:linear-gradient(135deg,var(--cream),var(--lavender));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .stat-label { font-size:0.78rem;color:rgba(245,240,232,0.45);margin-top:0.1rem; }

        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        /* ── BUTTONS ── */
        .btn-primary {
          display:inline-flex;align-items:center;gap:0.5rem;
          background:linear-gradient(135deg,var(--violet),#4F46E5);
          color:#fff;padding:0.85rem 2rem;border-radius:50px;
          font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:1rem;
          text-decoration:none;border:none;cursor:pointer;
          box-shadow:0 0 40px rgba(124,58,237,0.5);
          transition:transform 0.2s,box-shadow 0.2s;
        }
        .btn-primary:hover { transform:translateY(-2px);box-shadow:0 0 60px rgba(124,58,237,0.7); }
        .btn-secondary {
          display:inline-flex;align-items:center;gap:0.5rem;
          background:transparent;color:var(--cream);padding:0.85rem 2rem;border-radius:50px;
          border:1px solid rgba(255,255,255,0.15);
          font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:1rem;
          text-decoration:none;cursor:pointer;transition:background 0.2s,border-color 0.2s;
        }
        .btn-secondary:hover { background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.3); }

        /* ── ORBIT ── */
        .orbit-container { position:relative;width:100%;height:500px;display:flex;align-items:center;justify-content:center;animation:fade-up 1s 0.2s ease both; }
        .orbit-canvas { position:relative;width:420px;height:420px; }
        .core { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;background:linear-gradient(135deg,var(--violet),var(--cyan));border-radius:50%;box-shadow:0 0 0 12px rgba(124,58,237,0.15),0 0 60px rgba(0,212,255,0.4);display:flex;align-items:center;justify-content:center;font-size:2rem;z-index:10;animation:core-pulse 4s ease-in-out infinite; }
        @keyframes core-pulse { 0%,100%{box-shadow:0 0 0 12px rgba(124,58,237,0.15),0 0 60px rgba(0,212,255,0.4)} 50%{box-shadow:0 0 0 20px rgba(124,58,237,0.1),0 0 100px rgba(0,212,255,0.6)} }
        .ring { position:absolute;top:50%;left:50%;border-radius:50%;border:1px solid rgba(255,255,255,0.06);transform:translate(-50%,-50%); }
        .ring-1{width:160px;height:160px} .ring-2{width:270px;height:270px;border-color:rgba(124,58,237,0.15)} .ring-3{width:380px;height:380px}
        .orbit-node { position:absolute;top:50%;left:50%;width:48px;height:48px;margin:-24px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.12);box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:5; }
        .node-label { position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:0.62rem;font-weight:600;white-space:nowrap;color:rgba(245,240,232,0.6);letter-spacing:0.04em; }
        .n1{animation:orbit-cw  8s linear infinite;background:rgba(124,58,237,0.3)}
        .n2{animation:orbit-ccw 10s linear infinite;background:rgba(0,212,255,0.2)}
        .n3{animation:orbit-cw  12s linear infinite;background:rgba(196,181,253,0.2)}
        .n4{animation:orbit-cw  12s 4s linear infinite;background:rgba(124,58,237,0.25)}
        .n5{animation:orbit-cw  12s 8s linear infinite;background:rgba(0,212,255,0.15)}
        .n6{animation:orbit-ccw 18s linear infinite;background:rgba(79,70,229,0.25)}
        .n7{animation:orbit-ccw 18s 6s linear infinite;background:rgba(196,181,253,0.15)}
        .n8{animation:orbit-ccw 18s 12s linear infinite;background:rgba(0,212,255,0.2)}
        @keyframes orbit-cw  { from{transform:rotate(0deg) translateX(80px) rotate(0deg)} to{transform:rotate(360deg) translateX(80px) rotate(-360deg)} }
        @keyframes orbit-ccw { from{transform:rotate(0deg) translateX(140px) rotate(0deg)} to{transform:rotate(-360deg) translateX(140px) rotate(360deg)} }

        /* ── MARQUEE ── */
        .marquee-section { padding:2.5rem 0;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);overflow:hidden;position:relative;z-index:1; }
        .marquee-track { display:flex;gap:3rem;width:max-content;animation:marquee 30s linear infinite; }
        .marquee-item { display:flex;align-items:center;gap:0.75rem;font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:600;color:rgba(245,240,232,0.35);white-space:nowrap;letter-spacing:0.05em; }
        .marquee-dot { color:var(--cyan);font-size:1.2rem;opacity:0.6; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* ── SECTIONS ── */
        .lp-section { padding:7rem 5%;position:relative;z-index:1; }
        .section-eyebrow { text-align:center;font-size:0.78rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:1rem; }
        .section-title { text-align:center;font-family:'Space Grotesk',sans-serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:700;line-height:1.2;letter-spacing:-0.02em;max-width:600px;margin:0 auto 1rem; }
        .section-sub { text-align:center;color:rgba(245,240,232,0.5);max-width:500px;margin:0 auto 4rem;font-size:1rem; }

        /* ── BENTO ── */
        .bento { display:grid;grid-template-columns:repeat(12,1fr);gap:1.25rem;max-width:1200px;margin:0 auto; }
        .bento-card { background:var(--card-bg);border:1px solid var(--card-border);border-radius:24px;padding:2rem;position:relative;overflow:hidden;transition:transform 0.3s,border-color 0.3s,box-shadow 0.3s; }
        .bento-card::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.03)0%,transparent 60%);pointer-events:none; }
        .bento-card:hover { transform:translateY(-4px);border-color:rgba(124,58,237,0.3);box-shadow:0 20px 60px rgba(0,0,0,0.3),0 0 0 1px rgba(124,58,237,0.2); }
        .bc-1{grid-column:span 7} .bc-2{grid-column:span 5} .bc-3{grid-column:span 4} .bc-4{grid-column:span 4} .bc-5{grid-column:span 4} .bc-6{grid-column:span 5} .bc-7{grid-column:span 7}
        .bento-icon { width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.25rem; }
        .icon-violet{background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3)}
        .icon-cyan{background:rgba(0,212,255,0.15);border:1px solid rgba(0,212,255,0.25)}
        .icon-lav{background:rgba(196,181,253,0.15);border:1px solid rgba(196,181,253,0.2)}
        .icon-indigo{background:rgba(79,70,229,0.2);border:1px solid rgba(79,70,229,0.3)}
        .bento-title { font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:600;margin-bottom:0.6rem;letter-spacing:-0.01em; }
        .bento-desc { color:rgba(245,240,232,0.5);font-size:0.9rem;line-height:1.65; }
        .bc-1 .bento-title{font-size:1.6rem} .bc-1 .bento-desc{font-size:1rem;max-width:380px}

        .progress-bars{margin-top:1.5rem;display:flex;flex-direction:column;gap:0.75rem}
        .pb-row{display:flex;align-items:center;gap:1rem}
        .pb-label{font-size:0.8rem;font-weight:500;min-width:80px;color:rgba(245,240,232,0.7)}
        .pb-track{flex:1;height:6px;background:rgba(255,255,255,0.07);border-radius:99px;overflow:hidden}
        .pb-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--violet),var(--cyan));transform-origin:left;animation:fill-bar 1.5s 0.5s ease both}
        @keyframes fill-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}

        .streak-display{margin-top:1.5rem;display:flex;gap:0.5rem;flex-wrap:wrap}
        .streak-day{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700}
        .streak-day.active{background:linear-gradient(135deg,var(--violet),var(--cyan));color:#fff;box-shadow:0 0 12px rgba(124,58,237,0.5)}
        .streak-day.inactive{background:rgba(255,255,255,0.06);color:rgba(245,240,232,0.3)}
        .streak-num{margin-top:1rem;font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;background:linear-gradient(135deg,#FF6B35,#F59E0B);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

        .sparkline{margin-top:1.5rem;height:60px}
        .sparkline svg{width:100%;height:100%}

        .tag-cloud{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1.5rem}
        .lp-tag{padding:0.3rem 0.85rem;border-radius:50px;font-size:0.75rem;font-weight:600;border:1px solid rgba(255,255,255,0.1);color:rgba(245,240,232,0.6);background:rgba(255,255,255,0.04);transition:all 0.2s}
        .lp-tag:hover{border-color:var(--violet);color:var(--lavender)}
        .lp-tag.active{background:rgba(124,58,237,0.2);border-color:rgba(124,58,237,0.4);color:var(--lavender)}

        /* ── HOW ── */
        .how-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:2rem;max-width:1100px;margin:0 auto;position:relative}
        .how-grid::before{content:'';position:absolute;top:36px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(0,212,255,0.4),transparent);pointer-events:none}
        .how-step{text-align:center;padding:0 1rem}
        .step-num{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;margin:0 auto 1.5rem;background:linear-gradient(135deg,rgba(124,58,237,0.3),rgba(0,212,255,0.3));border:1px solid rgba(124,58,237,0.3);color:var(--lavender);box-shadow:0 0 30px rgba(124,58,237,0.2)}
        .how-step h3{font-family:'Space Grotesk',sans-serif;font-size:1.05rem;font-weight:600;margin-bottom:0.5rem}
        .how-step p{color:rgba(245,240,232,0.5);font-size:0.9rem}

        /* ── TESTIMONIALS ── */
        .t-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto}
        .t-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:20px;padding:1.75rem;transition:transform 0.3s,border-color 0.3s}
        .t-card:hover{transform:translateY(-3px);border-color:rgba(124,58,237,0.25)}
        .t-stars{color:#F59E0B;font-size:0.9rem;letter-spacing:2px;margin-bottom:1rem}
        .t-quote{font-size:0.95rem;color:rgba(245,240,232,0.75);line-height:1.7;margin-bottom:1.25rem;font-style:italic}
        .t-author{display:flex;align-items:center;gap:0.75rem}
        .t-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;background:linear-gradient(135deg,var(--violet),var(--cyan));color:#fff;font-family:'Space Grotesk',sans-serif;flex-shrink:0}
        .t-name{font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:600}
        .t-role{font-size:0.78rem;color:rgba(245,240,232,0.4)}

        /* ── CTA ── */
        .cta-section{padding:5rem 5%;position:relative;z-index:1;overflow:hidden}
        .cta-inner{max-width:900px;margin:0 auto;background:linear-gradient(135deg,rgba(124,58,237,0.2)0%,rgba(0,212,255,0.1)100%);border:1px solid rgba(124,58,237,0.3);border-radius:32px;padding:4rem 3rem;text-align:center;position:relative;overflow:hidden}
        .cta-inner::before{content:'';position:absolute;inset:-2px;background:linear-gradient(135deg,rgba(124,58,237,0.4),rgba(0,212,255,0.3));border-radius:34px;z-index:-1;opacity:0.5;filter:blur(8px)}
        .cta-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.8rem,3vw,2.8rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:1rem}
        .cta-sub{color:rgba(245,240,232,0.6);margin-bottom:2rem;font-size:1rem}
        .cta-actions{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap}

        /* ── FOOTER ── */
        .lp-footer{padding:3rem 5% 2rem;border-top:1px solid rgba(255,255,255,0.05);position:relative;z-index:1}
        .footer-inner{display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto;flex-wrap:wrap;gap:1rem}
        .footer-logo{font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:700;background:linear-gradient(135deg,var(--cyan),var(--violet-l));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .footer-links{display:flex;gap:2rem;list-style:none}
        .footer-links a{color:rgba(245,240,232,0.4);font-size:0.85rem;text-decoration:none;transition:color 0.2s}
        .footer-links a:hover{color:var(--cream)}
        .footer-copy{color:rgba(245,240,232,0.3);font-size:0.8rem}

        /* ── REVEAL ── */
        .reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}

        /* ── RESPONSIVE ── */
        @media(max-width:900px){
          .hero-content{grid-template-columns:1fr;text-align:center}
          .hero-sub,.hero-actions,.hero-stats{justify-content:center}
          .orbit-container{height:320px}
          .orbit-canvas{width:280px;height:280px}
          .n6,.n7,.n8,.ring-3{display:none}
          .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6,.bc-7{grid-column:span 12}
          .how-grid::before{display:none}
          .nav-links{display:none}
        }
        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
        }
      `}</style>

      <div className="lp-root">
        {/* ── NAV ── */}
        <nav id="main-nav">
          <span className="nav-logo">
            <img src="/mentara-new.png" alt="" style={{ width: '26px', height: '26px', display: 'block' }} />
            <span className="nav-logo-text">Mentara Labs</span>
          </span>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#testimonials">Stories</a></li>
            <li><Link to="/login" style={{ color: 'rgba(245,240,232,0.6)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Login</Link></li>
          </ul>
          <Link to="/register" className="nav-cta">Get Started Free</Link>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="hero-content">
            <div>
              <div className="hero-eyebrow"><span className="eyebrow-dot" />Intelligent Learning Platform</div>
              <h1 className="hero-headline">
                Master Every<br /><span className="headline-gradient">Subject. Every</span><br />Exam. Every Day.
              </h1>
              <p className="hero-sub">Mentara Labs connects you to structured courses, adaptive exams, and a streak system that turns consistency into your superpower.</p>
              <div className="hero-actions">
                <Link to="/register" className="btn-primary">
                  Start Learning Free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <a href="#features" className="btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".75" fill="currentColor"/></svg>
                  Explore Features
                </a>
              </div>
              <div className="hero-stats">
                <div><div className="stat-num">12K+</div><div className="stat-label">Active Learners</div></div>
                <div><div className="stat-num">500+</div><div className="stat-label">Exam Questions</div></div>
                <div><div className="stat-num">98%</div><div className="stat-label">Satisfaction</div></div>
              </div>
            </div>

            {/* Orbit */}
            <div className="orbit-container">
              <div className="orbit-canvas">
                <div className="ring ring-1" /><div className="ring ring-2" /><div className="ring ring-3" />
                <div className="core">🧠</div>
                <div className="orbit-node n1">📐<div className="node-label">Maths</div></div>
                <div className="orbit-node n2">🧪<div className="node-label">Science</div></div>
                <div className="orbit-node n3">📖<div className="node-label">English</div></div>
                <div className="orbit-node n4">🌍<div className="node-label">Geography</div></div>
                <div className="orbit-node n5">⚗️<div className="node-label">Chemistry</div></div>
                <div className="orbit-node n6">💡<div className="node-label">Physics</div></div>
                <div className="orbit-node n7">📜<div className="node-label">History</div></div>
                <div className="orbit-node n8">💻<div className="node-label">CS</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="marquee-section">
          <div className="marquee-track">
            {['Adaptive Exams','Structured Curriculum','Daily Streaks','Batch Management','Video Animations','Live Leaderboards','Instant Results','Progress Analytics',
              'Adaptive Exams','Structured Curriculum','Daily Streaks','Batch Management','Video Animations','Live Leaderboards','Instant Results','Progress Analytics']
              .map((t, i) => (
              <span className="marquee-item" key={i}><span className="marquee-dot">◆</span>{t}</span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="lp-section" id="features">
          <div className="section-eyebrow reveal">Everything you need</div>
          <h2 className="section-title reveal">A full learning ecosystem, not just an app</h2>
          <p className="section-sub reveal">From bite-sized lessons to full mock exams — every tool is built to make you better, faster.</p>
          <div className="bento">
            <div className="bento-card bc-1 reveal">
              <div className="bento-icon icon-violet">📈</div>
              <div className="bento-title">Real-time Progress Tracking</div>
              <p className="bento-desc">Watch your understanding grow chapter by chapter. Mentara Labs maps your knowledge gaps so every minute of study counts.</p>
              <div className="progress-bars">
                {[['Mathematics','82%',82],['Physics','67%',67],['Chemistry','91%',91],['English','54%',54]].map(([s,l,w]) => (
                  <div className="pb-row" key={s}>
                    <span className="pb-label">{s}</span>
                    <div className="pb-track"><div className="pb-fill" style={{width:`${w}%`}} /></div>
                    <span style={{fontSize:'0.78rem',color:'var(--lavender)'}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-card bc-2 reveal">
              <div className="bento-icon icon-cyan">🔥</div>
              <div className="bento-title">Daily Streak System</div>
              <p className="bento-desc">Consistency is the real exam strategy. Keep your streak alive and unlock rewards every week.</p>
              <div className="streak-display">
                {['M','T','W','T','F','S','S','M','T','W','T','F','S','S'].map((d,i) => (
                  <div key={i} className={`streak-day ${[2,3,4,7,8,9,10,11].includes(i) ? 'active' : 'inactive'}`}>{d}</div>
                ))}
              </div>
              <div className="streak-num">6 Day Streak 🔥</div>
            </div>

            <div className="bento-card bc-3 reveal">
              <div className="bento-icon icon-lav">📚</div>
              <div className="bento-title">Structured Curriculum</div>
              <p className="bento-desc">Every subject mapped chapter by chapter, with animated explainers attached to each concept.</p>
            </div>

            <div className="bento-card bc-4 reveal">
              <div className="bento-icon icon-violet">🎯</div>
              <div className="bento-title">Smart Mock Exams</div>
              <p className="bento-desc">Timed, scored, and instantly analysed. Know exactly what to fix before the real test.</p>
              <div className="sparkline">
                <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                  <defs><linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style={{stopColor:'rgba(0,212,255,0.3)'}}/><stop offset="100%" style={{stopColor:'rgba(0,212,255,0)'}}/></linearGradient></defs>
                  <path d="M0,50 L20,42 L40,45 L60,30 L80,35 L100,20 L120,25 L140,15 L160,18 L180,8 L200,5" fill="none" stroke="rgba(0,212,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M0,50 L20,42 L40,45 L60,30 L80,35 L100,20 L120,25 L140,15 L160,18 L180,8 L200,5 L200,60 L0,60 Z" fill="url(#sg)"/>
                </svg>
              </div>
            </div>

            <div className="bento-card bc-5 reveal">
              <div className="bento-icon icon-indigo">👥</div>
              <div className="bento-title">Batch Management</div>
              <p className="bento-desc">Admins can enrol students, track cohort performance, and assign exams in seconds.</p>
            </div>

            <div className="bento-card bc-6 reveal" style={{background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(0,212,255,0.08))'}}>
              <div className="bento-icon icon-cyan">🎬</div>
              <div className="bento-title">Animated Video Lessons</div>
              <p className="bento-desc">Complex concepts made crystal clear through short, engaging visual explainers — no 2-hour lectures.</p>
              <div className="tag-cloud">
                {['Algebra','Photosynthesis','Newton\'s Laws','Trigonometry','Electrostatics'].map((t,i) => (
                  <span key={t} className={`lp-tag ${[0,2,4].includes(i)?'active':''}`}>{t}</span>
                ))}
              </div>
            </div>

            <div className="bento-card bc-7 reveal">
              <div className="bento-icon icon-lav">🧩</div>
              <div className="bento-title">500+ Question Bank</div>
              <p className="bento-desc">MCQ, short-answer, and numericals across all subjects. Every question tagged by chapter, difficulty, and exam type so admins can build perfect test papers instantly.</p>
              <div className="tag-cloud">
                {['MCQ','Numerical','Short Answer','Chapter-wise','Past Papers','Difficulty Rated'].map((t,i) => (
                  <span key={t} className={`lp-tag ${[0,1,3,5].includes(i)?'active':''}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section" id="how" style={{background:'linear-gradient(180deg,transparent 0%,rgba(124,58,237,0.05) 50%,transparent 100%)'}}>
          <div className="section-eyebrow reveal">Simple process</div>
          <h2 className="section-title reveal">Up and running in minutes</h2>
          <p className="section-sub reveal">Whether you're a student joining a batch or an admin building a curriculum — Mentara Labs gets out of your way.</p>
          <div className="how-grid">
            {[
              ['1','Create your account','Sign up in under 30 seconds. Students join a batch; admins get their full dashboard instantly.'],
              ['2','Pick your subjects','Browse the structured curriculum and enrol into any active batch your institution has set up.'],
              ['3','Learn & practice daily','Watch animated lessons, solve questions from the bank, and keep your streak alive every day.'],
              ['4','Take exams, see results','Sit timed mock exams and get a full breakdown of your score the moment you submit.'],
            ].map(([n,h,p]) => (
              <div className="how-step reveal" key={n}>
                <div className="step-num">{n}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="lp-section" id="testimonials">
          <div className="section-eyebrow reveal">Student stories</div>
          <h2 className="section-title reveal">Real results. Real students.</h2>
          <p className="section-sub reveal">From first login to final exam — here's what our learners say.</p>
          <div className="t-grid">
            {[
              ['A','Arjun Mehta','Class 12 · JEE Aspirant','"The streak system completely changed how I study. I haven\'t missed a day in three weeks and my Physics score jumped from 54% to 87%."'],
              ['P','Priya Sharma','Science Teacher · 8 yrs experience','"As a teacher managing 4 batches, Mentara Labs\' admin panel saved me hours every week. I can assign exams and check results in minutes."'],
              ['R','Ritika Joshi','Class 11 · NEET Prep','"The animated lessons are so clear — way better than watching a 1-hour YouTube video. I finally understand Organic Chemistry."'],
            ].map(([av,name,role,quote]) => (
              <div className="t-card reveal" key={name}>
                <div className="t-stars">★★★★★</div>
                <p className="t-quote">{quote}</p>
                <div className="t-author">
                  <div className="t-avatar">{av}</div>
                  <div><div className="t-name">{name}</div><div className="t-role">{role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section reveal">
          <div className="cta-inner">
            <h2 className="cta-title">Ready to transform how you learn?</h2>
            <p className="cta-sub">Join thousands of students already using Mentara Labs to ace their exams.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary">
                Get started — it's free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/login" className="btn-secondary">Login to your account</Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="footer-inner">
            <div className="footer-logo">Mentara Labs</div>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how">How it works</a></li>
              <li><Link to="/login" style={{color:'rgba(245,240,232,0.4)',textDecoration:'none',fontSize:'0.85rem'}}>Login</Link></li>
              <li><Link to="/register" style={{color:'rgba(245,240,232,0.4)',textDecoration:'none',fontSize:'0.85rem'}}>Register</Link></li>
            </ul>
            <div className="footer-copy">© 2025 Mentara Labs. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </>
  );
}