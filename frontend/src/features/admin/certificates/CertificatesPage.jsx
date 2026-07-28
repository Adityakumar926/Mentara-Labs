import { useState, useEffect, useRef } from 'react';
import { Search, Award, Download, Eye, Calendar, User, FileText, ArrowLeft } from 'lucide-react';
import { PageWrapper, Button, Badge, Skeleton, Modal, Input, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import CertificateCard from '@/components/shared/CertificateCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function CertificatesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingCert, setViewingCert] = useState(null);
  const [pdfCert, setPdfCert] = useState(null);
  const printContainerRef = useRef(null);

  // Debounce search input
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
        <div className="relative bg-gradient-to-r from-purple-900/20 via-cyan-900/10 to-transparent border border-white/5 rounded-3xl p-8 overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-600/10 blur-[70px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-cyan-600/10 blur-[70px] pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-300">
              <Award size={14} className="text-cyan-400 animate-pulse" />
              Academic Credentials
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Issued Certificates</h1>
            <p className="text-sm text-zinc-400">
              Monitor, verify, and view all academic completion certificates earned by students on Mentara Labs.
            </p>
          </div>
        </div>

        {/* Search controls */}
        <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name, exam name, or Certificate ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Table/List */}
        <div className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden">
          {loading && !data ? (
            <div className="p-8 flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 font-semibold">{error}</div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Award}
                title="No Certificates Found"
                description={debouncedSearch ? "Try adjusting your search filters to find matching records." : "No student has earned a certificate yet."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Certificate ID</th>
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Exam Name</th>
                    <th className="py-4 px-6">Issue Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {data.data.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-purple-400 text-sm">
                        {cert.certificate_id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{cert.student_name}</span>
                          <span className="text-xs text-zinc-500">{cert.student_email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {cert.exam_name}
                      </td>
                      <td className="py-4 px-6 text-sm text-zinc-400">
                        {new Date(cert.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingCert(cert)}
                            title="Preview Certificate"
                            className="text-zinc-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(cert)}
                            title="Download PDF"
                            className="text-zinc-400 hover:text-purple-400"
                          >
                            <Download size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between p-6 border-t border-white/5 bg-zinc-950/20 text-sm">
                  <span className="text-zinc-500">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} certificates
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
