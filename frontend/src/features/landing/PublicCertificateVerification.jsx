import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { PageWrapper, Button, Skeleton } from '@/components/ui';
import CertificateCard from '@/components/shared/CertificateCard';

export default function PublicCertificateVerification() {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/public/certificates/${encodeURIComponent(certificateId)}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Certificate not found.');
        }
      } catch (err) {
        setError('An error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };
    if (certificateId) verify();
  }, [certificateId]);

  return (
    <div className="min-height-screen bg-[#080C16] text-[#F4F6FC] font-sans flex flex-col justify-between py-12 px-6">
      <style>{`
        .verify-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          border-radius: 28px;
          padding: 3rem 2rem;
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          text-align: center;
        }
        .cert-glow {
          box-shadow: 0 0 40px rgba(139, 92, 246, 0.15);
        }
      `}</style>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="verify-card flex flex-col items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-8 w-2/3 mt-4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full mt-6" />
          </div>
        ) : error ? (
          <div className="verify-card border-red-500/20">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-400 mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Certificate Not Found</h1>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-8">
              We couldn't verify any certificate matching the code <span className="font-mono text-red-400 font-bold">{certificateId}</span>.
            </p>
            <div className="flex flex-col gap-3 items-center justify-center">
              <Link to="/">
                <Button variant="primary" className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600">
                  <ArrowLeft size={16} /> Go to Mentara Labs
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
            {/* Verification Status Header */}
            <div className="verify-card border-emerald-500/20 w-full max-w-xl">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6 animate-pulse">
                <CheckCircle size={32} />
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300">
                Official Verification Status
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-4 mb-2">Certificate Verified</h1>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
                This certificate is authentic and officially issued by Mentara Labs.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-left border-t border-white/5 pt-6 mt-6 text-sm">
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider font-bold">Student Name</span>
                  <span className="text-white font-semibold">{data.student_name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider font-bold">Exam Assessment</span>
                  <span className="text-white font-semibold">{data.exam_name}</span>
                </div>
                <div className="mt-2">
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider font-bold">Certificate ID</span>
                  <span className="text-purple-400 font-mono font-bold">{data.certificate_id}</span>
                </div>
                <div className="mt-2">
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider font-bold">Issue Date</span>
                  <span className="text-white font-semibold">
                    {new Date(data.issue_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Render Card */}
            <div className="flex flex-col items-center gap-4 w-full bg-zinc-950/40 border border-white/5 p-8 rounded-3xl cert-glow">
              <h2 className="text-lg font-bold text-zinc-400">Digital Certificate Preview</h2>
              <div className="overflow-hidden w-full flex justify-center bg-zinc-950 p-6 rounded-2xl border border-white/5">
                <CertificateCard
                  studentName={data.student_name}
                  examName={data.exam_name}
                  certificateId={data.certificate_id}
                  issueDate={data.issue_date}
                />
              </div>
            </div>

            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <ArrowLeft size={16} /> Return to Homepage
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-600 mt-12">
        © {new Date().getFullYear()} Mentara Labs. All rights reserved. Secure cryptographic verification enabled.
      </footer>
    </div>
  );
}
