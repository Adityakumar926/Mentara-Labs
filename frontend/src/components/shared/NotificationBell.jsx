import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, Calendar, Radio } from 'lucide-react';
import useNotificationStore from '@/store/notificationStore';

const CSS = `
  .nb-desktop-trigger {
    position: relative;
    width: 30px; height: 30px; border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    color: rgba(245,240,232,0.55);
    cursor: pointer; flex-shrink: 0;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
  }
  .nb-desktop-trigger:hover {
    color: #F5F0E8;
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.14);
  }

  .nb-mobile-trigger {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 0.6rem 0 0.55rem; gap: 0.22rem;
    background: none; border: none; cursor: pointer;
    color: rgba(245,240,232,0.35);
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.04em;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s;
  }
  .nb-mobile-trigger:hover { color: rgba(245,240,232,0.7); }

  .nb-icon-wrap { position: relative; display: inline-flex; }
  .nb-badge {
    position: absolute; top: -5px; right: -7px;
    min-width: 14px; height: 14px; padding: 0 3px;
    border-radius: 7px;
    background: linear-gradient(135deg, #F59E0B, #DC2626);
    border: 1.5px solid #0A0E1A;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.52rem; font-weight: 700; color: #fff;
    line-height: 1;
    font-family: 'Inter', sans-serif;
  }

  .nb-backdrop {
    position: fixed; inset: 0; z-index: 200;
    background: transparent;
  }

  .nb-dropdown {
    position: fixed; z-index: 201;
    width: 320px; max-height: 420px;
    background: #11162A;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.45);
    display: flex; flex-direction: column;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
  }

  .nb-sheet {
    position: fixed; z-index: 201;
    left: 0; right: 0; bottom: 0;
    max-height: 70vh;
    background: #11162A;
    border-top: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -16px 40px rgba(0,0,0,0.45);
    display: flex; flex-direction: column;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
  }

  .nb-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.9rem 1rem 0.7rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }
  .nb-header-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem; font-weight: 700; color: #F5F0E8;
  }
  .nb-mark-all {
    display: flex; align-items: center; gap: 0.3rem;
    background: none; border: none; cursor: pointer;
    font-size: 0.65rem; font-weight: 600; color: #C4B5FD;
    padding: 0.2rem 0.4rem; border-radius: 8px;
    transition: background 0.2s;
  }
  .nb-mark-all:hover { background: rgba(124,58,237,0.14); }

  .nb-list { overflow-y: auto; }
  .nb-list::-webkit-scrollbar { width: 6px; }
  .nb-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

  .nb-empty {
    padding: 2rem 1rem; text-align: center;
    font-size: 0.72rem; color: rgba(245,240,232,0.35);
  }

  .nb-item {
    width: 100%; display: flex; align-items: flex-start; gap: 0.6rem;
    padding: 0.7rem 1rem; border: none; background: none; cursor: pointer;
    text-align: left; position: relative;
    border-bottom: 1px solid rgba(255,255,255,0.045);
    transition: background 0.15s;
  }
  .nb-item:hover { background: rgba(255,255,255,0.035); }
  .nb-item:last-child { border-bottom: none; }

  .nb-item-icon {
    width: 26px; height: 26px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
  }
  .nb-item-icon.scheduled { background: rgba(124,58,237,0.16); color: #C4B5FD; }
  .nb-item-icon.live { background: rgba(34,197,94,0.16); color: #4ADE80; }

  .nb-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
  .nb-item-title {
    font-size: 0.74rem; font-weight: 600;
    color: rgba(245,240,232,0.92);
  }
  .nb-item.unread .nb-item-title { color: #F5F0E8; }
  .nb-item-msg {
    font-size: 0.68rem; color: rgba(245,240,232,0.45);
    overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .nb-item-time { font-size: 0.6rem; color: rgba(245,240,232,0.3); margin-top: 0.1rem; }

  .nb-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #7C3AED, #00D4FF);
    box-shadow: 0 0 6px rgba(124,58,237,0.7);
    margin-top: 6px;
  }
`;

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell({ variant = 'desktop' }) {
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const isMobile = variant === 'mobile';

  useEffect(() => {
    fetch();
  }, []);

  const handleToggle = () => {
    if (!open && !isMobile && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 10, left: rect.left });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <style>{CSS}</style>

      <button
        ref={triggerRef}
        className={isMobile ? 'nb-mobile-trigger' : 'nb-desktop-trigger'}
        onClick={handleToggle}
        title="Notifications"
      >
        <span className="nb-icon-wrap">
          <Bell size={isMobile ? 19 : 15} />
          {unreadCount > 0 && <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </span>
        {isMobile && 'Alerts'}
      </button>

      {open &&
        createPortal(
          <AnimatePresence>
            <motion.div key="nb-backdrop" className="nb-backdrop" onClick={() => setOpen(false)} />
            <motion.div
              key="nb-panel"
              className={isMobile ? 'nb-sheet' : 'nb-dropdown'}
              style={!isMobile ? { top: coords.top, left: coords.left } : undefined}
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: -8, scale: 0.97 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="nb-header">
                <span className="nb-header-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="nb-mark-all" onClick={markAllRead}>
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="nb-list">
                {(notifications || []).length === 0 && (
                  <div className="nb-empty">You're all caught up — no notifications yet.</div>
                )}
                {(notifications || []).map((n) => (
                  <button
                    key={n.id}
                    className={`nb-item${n.is_read ? '' : ' unread'}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className={`nb-item-icon ${n.type === 'exam_live' ? 'live' : 'scheduled'}`}>
                      {n.type === 'exam_live' ? <Radio size={13} /> : <Calendar size={13} />}
                    </span>
                    <span className="nb-item-body">
                      <span className="nb-item-title">{n.title}</span>
                      <span className="nb-item-msg">{n.message}</span>
                      <span className="nb-item-time">{timeAgo(n.created_at)}</span>
                    </span>
                    {!n.is_read && <span className="nb-dot" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}