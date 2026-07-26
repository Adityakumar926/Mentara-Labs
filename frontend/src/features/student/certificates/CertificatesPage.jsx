import { useState, useEffect, useRef } from 'react';
import { Award, Download, Eye, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { PageWrapper, Button, Badge, Skeleton, Modal, EmptyState } from '@/components/ui';
import CertificateCard from '@/components/shared/CertificateCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function StudentCertificatesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);
  const [pdfCert, setPdfCert] = useState(null);
  const printContainerRef = useRef(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/student/certificates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownloadPDF = (cert) => {
    setPdfCert(cert);
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
          pixelRatio: 3, // Premium quality rasterization
          cacheBust: true
        })
        .then((dataUrl) => {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
          });
          // A4 dimensions: 841.89 pt x 595.28 pt
          pdf.addImage(dataUrl, 'PNG', 0, 0, 841.89, 595.28, undefined, 'FAST');
          pdf.save(`MentaraLabs-Certificate-${pdfCert.certificate_id}.pdf`);
          setPdfCert(null);
        })
        .catch((err) => {
          console.error('Failed to generate PDF image', err);
          setPdfCert(null);
        });
      });
    };

    generate();
  }, [pdfCert]);

  return (
    <PageWrapper className="p-6">
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-900/30 via-indigo-900/20 to-transparent border border-white/5 rounded-3xl p-8 overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-600/10 blur-[70px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-cyan-600/10 blur-[70px] pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-violet-300">
              <Award size={14} className="text-yellow-400 animate-bounce" />
              Your Achievements
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Certificates</h1>
            <p className="text-sm text-zinc-400">
              Earn and download official completion certificates by successfully passing checkpoint mock quests.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 text-center text-red-300">
            <AlertCircle className="mx-auto mb-2 text-red-400" size={32} />
            <h3 className="font-semibold text-lg">Failed to load certificates</h3>
            <p className="text-sm text-zinc-400 mt-1">{error}</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-12">
            <EmptyState
              icon={Award}
              title="No Certificates Yet 🏆"
              description="Pass certificate-enabled checkpoint exams to earn your official completion certificates!"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((cert) => (
              <div 
                key={cert.id} 
                className="group relative bg-zinc-900/30 border border-white/5 rounded-3xl p-6 overflow-hidden hover:border-violet-500/40 hover:bg-zinc-900/50 transition-all duration-300 shadow-lg hover:shadow-violet-950/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-600/10 to-transparent blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2.5 py-1 rounded-md w-fit">
                      {cert.certificate_id}
                    </span>
                    <h3 className="font-bold text-xl text-white group-hover:text-violet-300 transition-colors mt-2">
                      {cert.exam_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-2 font-medium">
                      <Calendar size={14} className="text-zinc-500" />
                      Issued on {new Date(cert.issue_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-yellow-400 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                    🏆
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    className="flex-1 flex items-center justify-center gap-2 bg-white/[0.02] border border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    onClick={() => setViewingCert(cert)}
                  >
                    <Eye size={16} /> View
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/40"
                    onClick={() => handleDownloadPDF(cert)}
                  >
                    <Download size={16} /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Viewing Modal */}
        <Modal
          open={!!viewingCert}
          onClose={() => setViewingCert(null)}
          title={`Certificate: ${viewingCert?.certificate_id}`}
          size="xl"
        >
          {viewingCert && (
            <div className="flex flex-col items-center gap-6 p-4">
              <div className="overflow-hidden w-full flex justify-center bg-zinc-950 p-6 rounded-2xl border border-white/5">
                <CertificateCard
                  studentName={viewingCert.student_name}
                  examName={viewingCert.exam_name}
                  certificateId={viewingCert.certificate_id}
                  issueDate={viewingCert.issue_date}
                />
              </div>
              <div className="flex gap-3 justify-end w-full">
                <Button variant="ghost" onClick={() => setViewingCert(null)}>
                  Close
                </Button>
                <Button variant="primary" className="flex items-center gap-2" onClick={() => handleDownloadPDF(viewingCert)}>
                  <Download size={16} /> Download PDF
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
