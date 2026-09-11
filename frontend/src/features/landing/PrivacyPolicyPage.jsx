import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Eye, Server, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', margin: 0 }}>Privacy Policy</h1>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', margin: 0 }}>
            Last Updated: September 12, 2026 • Mentara Labs Educational Platform
          </p>
        </div>

        {/* Body Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem' }}>
          
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Eye size={18} /> 1. Information We Collect
            </h2>
            <p>
              When you sign up or log in to Mentara Labs using email registration or Google Sign-In, we collect basic profile information necessary to provide educational service:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Account Identifiers:</strong> Your full name, email address, and profile picture (avatar).</li>
              <li><strong>Academic Context:</strong> Selected curriculum (e.g., Cambridge Primary/Lower Secondary), grade level, and enrolled virtual classrooms.</li>
              <li><strong>Usage & Progress:</strong> Practice exam responses, generated question sets, test scores, and streak data.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Server size={18} /> 2. How We Use Your Information
            </h2>
            <p>Mentara Labs uses collected data strictly for educational and service operations:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Authenticating user sessions and granting access to teacher and student dashboards.</li>
              <li>Managing virtual classrooms, student invitations, and seat allocations.</li>
              <li>Generating adaptive practice exams and performance analytics.</li>
              <li>Sending essential account notifications and invitation updates.</li>
            </ul>
            <p style={{ marginTop: '0.75rem', color: '#93c5fd' }}>
              <strong>Zero Data Selling:</strong> Mentara Labs does not sell, rent, or trade personal information to any third parties or advertisers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Lock size={18} /> 3. Data Protection & Security
            </h2>
            <p>
              We enforce robust administrative, technical, and physical security measures to safeguard user data, including HTTPS/TLS encryption for all data in transit and encrypted authentication tokens.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Mail size={18} /> 4. Contact Us
            </h2>
            <p>
              If you have any questions or privacy inquiries regarding Mentara Labs, please contact our support team at:
            </p>
            <p style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px', color: '#38bdf8', fontWeight: 600, width: 'fit-content' }}>
              ✉️ adityakum.9430@gmail.com
            </p>
          </section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(59, 130, 246, 0.15)', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          © 2026 Mentara Labs. All rights reserved. • <Link to="/terms" style={{ color: '#38bdf8', textDecoration: 'none' }}>Terms of Service</Link>
        </div>

      </div>
    </div>
  );
}
