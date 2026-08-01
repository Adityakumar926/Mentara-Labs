import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Award, Download, Eye, Calendar, User, FileText, ArrowLeft,
  Sparkles, CheckCircle2, ShieldCheck, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Button, Badge, Skeleton, Modal, Input, EmptyState } from '@/components/ui';
import { adminApi } from '@/api/services';
import CertificateCard from '@/components/shared/CertificateCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .cert-root {
    --navy:     #080C16;
    --navy2:    #0D1322;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    rgba(245,240,232,0.55);
    --card-bg:  rgba(13, 19, 34, 0.75);
    --card-bdr: rgba(255, 255, 255, 0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }

  /* ── HERO BANNER ── */
  .cert-hero {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(0,212,255,0.08) 50%, rgba(16,185,129,0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 2.25rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(24px);
    margin-bottom: 1.75rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .cert-hblob {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .cert-hblob-1 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -120px; right: -80px;
    animation: cert-drift 12s ease-in-out infinite alternate;
  }
  .cert-hblob-2 {
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%);
    bottom: -60px; left: 30%;
    animation: cert-drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes cert-drift { from{transform:translate(0,0)} to{transform:translate(25px,-20px)} }

  .cert-status-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.35);
    padding: 0.35rem 0.95rem; border-radius: 50px;
    font-size: 0.72rem; font-weight: 700; color: #C4B5FD;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }
  .cert-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00D4FF; box-shadow: 0 0 10px #00D4FF;
    animation: cert-blink 2s infinite ease-in-out;
  }
  @keyframes cert-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .cert-hero-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.75rem, 3.5vw, 2.35rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #C4B5FD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    margin-bottom: 0.4rem;
  }
  .cert-hero-sub {
    font-size: 0.9rem; color: #94A3B8; font-weight: 500; max-width: 540px;
  }

  /* ── STATS ROW ── */
  .cert-stats-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem; margin-bottom: 1.5rem;
  }
  .cert-stat-box {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 18px; padding: 1.1rem 1.25rem; backdrop-filter: blur(20px);
    display: flex; align-items: center; gap: 1rem;
    transition: all 0.25s ease;
  }
  .cert-stat-box:hover {
    border-color: rgba(255, 255, 255, 0.15); transform: translateY(-2px);
  }
  .cert-stat-icon-wrap {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cert-stat-val { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 900; color: #FFF; line-height: 1; }
  .cert-stat-lbl { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin-top: 0.2rem; }

  /* ── SEARCH & BAR ── */
  .cert-controls-bar {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 20px; padding: 0.85rem 1.25rem; backdrop-filter: blur(20px);
    margin-bottom: 1.75rem;
  }
  .cert-search-wrap {
    position: relative; flex: 1; min-width: 260px; max-width: 450px;
  }
  .cert-search-input {
    width: 100%;
    background: rgba(15, 23, 42, 0.85) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 12px;
    padding: 0.65rem 1rem 0.65rem 2.4rem;
    color: #FFFFFF !important;
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s ease;
  }
  .cert-search-input::placeholder { color: #94A3B8 !important; }
  .cert-search-input:focus {
    border-color: rgba(0, 212, 255, 0.6) !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.25) !important;
  }

  /* ── TABLE STYLES ── */
  .cert-table-wrap {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 24px; overflow: hidden; backdrop-filter: blur(24px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }
  .cert-table { width: 100%; border-collapse: collapse; text-align: left; }
  .cert-table th {
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 1rem 1.25rem; font-size: 0.72rem; font-weight: 800;
    color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .cert-table td {
    padding: 1.1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 0.83rem; color: #E2E8F0; vertical-align: middle;
  }
  .cert-table tr:last-child td { border-bottom: none; }
  .cert-table tr:hover td { background: rgba(255,255,255,0.02); }

  .cert-id-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-family: 'Space Grotesk', monospace; font-size: 0.8rem; font-weight: 700;
    color: #C4B5FD; background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25);
    padding: 0.3rem 0.7rem; border-radius: 10px;
  }
  .cert-action-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: #94A3B8; cursor: pointer; transition: all 0.2s ease;
  }
  .cert-action-btn:hover { background: rgba(255,255,255,0.1); color: #FFF; }
  .cert-action-btn.view:hover { color: #00D4FF; border-color: rgba(0,212,255,0.4); background: rgba(0,212,255,0.12); }
  .cert-action-btn.download:hover { color: #C4B5FD; border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.15); }
`;

export default function CertificatesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingCert, setViewingCert] = useState(null);
  const [pdfCert, setPdfCert] = useState(null);
  const printContainerRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCertificates({
        search: debouncedSearch,
        page,
        limit: 10
      });
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [debouncedSearch, page]);

  const handleDownloadPDF = (cert) => {
    setPdfCert(cert);
    toast.success(`Preparing PDF for ${cert.student_name}...`);
  };

  const copyCertId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success(`Certificate ID copied: ${id}`);
  };

  useEffect(() => {
    if (!pdfCert) return;

    const generate = () => {
      const element = printContainerRef.current?.firstElementChild;
      if (!element) {
        setTimeout(generate, 50);
        return;
      }

      document.fonts.ready.then(() => {
        toPng(element, {
          width: 1000,
          height: 707,
          style: {
            transform: 'none',
            margin: '0',
            padding: '0',
            boxShadow: 'none'
          },
          pixelRatio: 3,
          cacheBust: true
        })
        .then((dataUrl) => {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, 841.89, 595.28, undefined, 'FAST');
          pdf.save(`MentaraLabs-Certificate-${pdfCert.certificate_id}.pdf`);
          setPdfCert(null);
          toast.success('Certificate downloaded successfully!');
        })
        .catch((err) => {
          console.error('Failed to generate PDF image', err);
          setPdfCert(null);
          toast.error('Failed to download PDF');
        });
      });
    };

    generate();
  }, [pdfCert]);

  const certList = data?.data ?? [];
  const totalCount = data?.pagination?.total ?? certList.length;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="cert-root">

        {/* ── HERO BANNER ── */}
        <motion.div
          className="cert-hero"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cert-hblob cert-hblob-1" />
          <div className="cert-hblob cert-hblob-2" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="cert-status-pill">
                <span className="cert-status-dot" />
                Academic Credential Verification
              </div>
              <h1 className="cert-hero-title">Issued Certificates</h1>
              <p className="cert-hero-sub">
                Monitor, verify, and export all academic completion certificates earned by students on Mentara Labs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── SUMMARY STATS ── */}
        <div className="cert-stats-grid">
          <div className="cert-stat-box">
            <div className="cert-stat-icon-wrap bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Award size={20} />
            </div>
            <div>
              <div className="cert-stat-val">{totalCount}</div>
              <div className="cert-stat-lbl">Issued Certificates</div>
            </div>
          </div>

          <div className="cert-stat-box">
            <div className="cert-stat-icon-wrap bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="cert-stat-val">100%</div>
              <div className="cert-stat-lbl">Authenticity Verified</div>
            </div>
          </div>

          <div className="cert-stat-box">
            <div className="cert-stat-icon-wrap bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="cert-stat-val">{certList.length}</div>
              <div className="cert-stat-lbl">Current Page Records</div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS BAR ── */}
        <div className="cert-controls-bar">
          <div className="cert-search-wrap">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, exam, or Certificate ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cert-search-input"
            />
          </div>

          <button
            onClick={fetchCertificates}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh List
          </button>
        </div>

        {/* ── CERTIFICATES TABLE ── */}
        <div className="cert-table-wrap">
          {loading && !data ? (
            <div className="p-8 space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-slate-900/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400 font-semibold">{error}</div>
          ) : certList.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Award}
                title="No Certificates Found"
                description={debouncedSearch ? `No records matching "${debouncedSearch}"` : "No student has earned a completion certificate yet."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="cert-table">
                <thead>
                  <tr>
                    <th>Certificate ID</th>
                    <th>Student Name & Email</th>
                    <th>Exam Course Title</th>
                    <th>Issue Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certList.map((cert) => (
                    <tr key={cert.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="cert-id-badge">{cert.certificate_id}</span>
                          <button
                            onClick={() => copyCertId(cert.certificate_id)}
                            className="text-slate-500 hover:text-purple-300 transition-colors"
                            title="Copy Certificate ID"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <User size={13} className="text-cyan-400" />
                            {cert.student_name}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">{cert.student_email}</span>
                        </div>
                      </td>

                      <td>
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <FileText size={13} className="text-purple-400" />
                          {cert.exam_name}
                        </span>
                      </td>

                      <td className="text-xs text-slate-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-500" />
                          {new Date(cert.issue_date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </div>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingCert(cert)}
                            title="Preview Certificate"
                            className="cert-action-btn view"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(cert)}
                            title="Download PDF"
                            className="cert-action-btn download"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between p-5 border-t border-slate-800/80 bg-slate-900/40 text-xs">
                  <span className="text-slate-400 font-medium">
                    Showing <strong className="text-white">{(page - 1) * 10 + 1}</strong> to <strong className="text-white">{Math.min(page * 10, data.pagination.total)}</strong> of <strong className="text-white">{data.pagination.total}</strong> certificates
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === data.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Viewing Modal */}
        <Modal
          open={!!viewingCert}
          onClose={() => setViewingCert(null)}
          title={`Certificate Preview: ${viewingCert?.certificate_id}`}
          size="xl"
        >
          {viewingCert && (
            <div className="flex flex-col items-center gap-6 p-4">
              <div className="overflow-hidden w-full flex justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">
                <CertificateCard
                  studentName={viewingCert.student_name}
                  examName={viewingCert.exam_name}
                  certificateId={viewingCert.certificate_id}
                  issueDate={viewingCert.issue_date}
                />
              </div>
              <div className="flex gap-3 justify-end w-full pt-2 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setViewingCert(null)}>
                  Close
                </Button>
                <Button variant="primary" className="flex items-center gap-2" onClick={() => handleDownloadPDF(viewingCert)}>
                  <Download size={16} /> Download High-Res PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Hidden rendering wrapper for PDF downloads */}
        {pdfCert && (
          <div 
            ref={printContainerRef}
            style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden', width: '1000px', height: '707px' }}
          >
            <CertificateCard
              studentName={pdfCert.student_name}
              examName={pdfCert.exam_name}
              certificateId={pdfCert.certificate_id}
              issueDate={pdfCert.issue_date}
              isPrinting={true}
            />
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
