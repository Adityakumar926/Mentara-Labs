import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, CheckCircle, Scale, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#ffffff', fontFamily: 'Inter, sans-serif', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Mentara Labs
        </Link>

        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <FileText size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', margin: 0 }}>Terms of Service</h1>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', margin: 0 }}>
            Last Updated: September 12, 2026 • Mentara Labs Educational Platform
          </p>
        </div>

        {/* Body Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem' }}>
          
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <CheckCircle size={18} /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Mentara Labs, you agree to comply with these Terms of Service. Mentara Labs provides educational curriculum practice, mock exams, and virtual classroom tools for students and teachers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Scale size={18} /> 2. User Accounts & Responsibilities
            </h2>
            <p>Users are responsible for maintaining the confidentiality of their login credentials and for all activities conducted under their account.</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Teacher Accounts:</strong> Responsible for managing classroom memberships, student invitations, and assigned study content within platform seat limits.</li>
              <li><strong>Student Accounts:</strong> Entitled to participate in assigned classrooms, practice mock exams, and access learning materials.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Mail size={18} /> 3. Contact & Support
            </h2>
            <p>For questions or terms inquiries, please reach out to:</p>
            <p style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', color: '#38bdf8', fontWeight: 600, width: 'fit-content' }}>
              ✉️ adityakum.9430@gmail.com
            </p>
          </section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(59, 130, 246, 0.15)', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          © 2026 Mentara Labs. All rights reserved. • <Link to="/privacy" style={{ color: '#38bdf8', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>

      </div>
    </div>
  );
}
