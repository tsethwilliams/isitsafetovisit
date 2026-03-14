import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'IsItSafeToVisit.com terms of use. Guidelines for using our travel safety information.',
};

export default function TermsPage() {
  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span> Terms of Use
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>Terms of Use</h1>
          <p className="page-hero-sub">Last updated: March 2026</p>
        </div>
      </section>

      <div className="container">
        <div className="about-content">
          <section className="content-section">
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using IsItSafeToVisit.com, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website.</p>
          </section>

          <section className="content-section">
            <h2>Information Disclaimer</h2>
            <p>The safety information, scores, and recommendations on IsItSafeToVisit.com are provided for general informational purposes only. Safety conditions can change rapidly due to political events, natural disasters, crime trends, and other factors. While we strive to keep our information current and accurate, we make no guarantees about the completeness, reliability, or accuracy of any content on this site.</p>
            <p>Our safety scores represent our research-based assessment at the time of publication and should not be your sole source of travel safety information. Always consult official government travel advisories from your home country before traveling.</p>
          </section>

          <section className="content-section">
            <h2>Limitation of Liability</h2>
            <p>IsItSafeToVisit.com and its operators are not liable for any loss, injury, or damage arising from your use of the information on this website. Travel decisions are your own responsibility. We strongly recommend purchasing travel insurance for any international trip.</p>
          </section>

          <section className="content-section">
            <h2>Affiliate Links</h2>
            <p>This website contains affiliate links to third-party products and services. When you click these links and make purchases, we may receive a commission. This does not affect the price you pay. Affiliate relationships do not influence our safety ratings or editorial content.</p>
          </section>

          <section className="content-section">
            <h2>Intellectual Property</h2>
            <p>All content on IsItSafeToVisit.com, including text, safety scores, data, and design, is the property of IsItSafeToVisit.com and is protected by copyright. You may share links to our pages but may not reproduce, distribute, or republish our content without written permission.</p>
          </section>

          <section className="content-section">
            <h2>User Conduct</h2>
            <p>You agree not to use this website for any unlawful purpose, not to attempt to gain unauthorized access to our systems, and not to use automated tools to scrape or download our content in bulk.</p>
          </section>

          <section className="content-section">
            <h2>Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section className="content-section">
            <h2>Contact</h2>
            <p>For questions about these terms, contact us at <strong>hello@isitsafetovisit.com</strong>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
