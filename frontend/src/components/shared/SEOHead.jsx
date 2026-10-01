import { useEffect } from 'react';

export default function SEOHead({
  title = 'Mentara Labs | Cambridge Primary Questions Stage 1–5 | Interactive Learning Platform',
  description = 'Mentara Labs (mentp.com) is an interactive Cambridge Primary learning platform offering stage 1 to 5 questions, worksheets, simulations, and checkpoint assessments.',
  keywords = 'Mentara Labs, Cambridge Primary questions, stage 1 to 5, Cambridge checkpoint, worksheets, 3D simulations',
  canonical = '/',
  image = 'https://www.mentp.com/mentara-new.png',
  type = 'website',
  schemaData = null,
}) {
  useEffect(() => {
    // 1. Document Title
    document.title = title;

    // 2. Helper to set or update meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', 'index, follow');

    // Open Graph
    const canonicalUrl = `https://www.mentp.com${canonical.startsWith('/') ? canonical : `/${canonical}`}`;
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Mentara Labs');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Canonical link tag
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // Optional dynamic schema JSON-LD injection
    if (schemaData) {
      const scriptId = 'dynamic-seo-schema';
      let scriptEl = document.getElementById(scriptId);
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schemaData);
    }
  }, [title, description, keywords, canonical, image, type, schemaData]);

  return null;
}
