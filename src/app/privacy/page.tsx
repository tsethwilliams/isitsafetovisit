import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'IsItSafeToVisit.com privacy policy. How we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span> Privacy Policy
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="page-hero-sub">Last updated: March 2026</p>
        </div>
      </section>

      <div className="container">
        <div className="about-content">
          <section className="content-section">
            <h2>Information We Collect</h2>
            <p>IsItSafeToVisit.com collects minimal personal information. We use Google Analytics to track anonymous usage data such as pages visited, time on site, and general geographic location. We do not collect names, email addresses, or other personally identifiable information unless you voluntarily provide it through our newsletter signup.</p>
          </section>

          <section className="content-section">
            <h2>How We Use Your Information</h2>
            <p>Usage data from Google Analytics helps us understand which cities and topics are most popular, so we can prioritize creating and updating content that travelers find most useful. If you subscribe to our newsletter, your email address is used solely to send you travel safety updates and will never be sold or shared with third parties.</p>
          </section>

          <section className="content-section">
            <h2>Cookies</h2>
            <p>We use cookies for Google Analytics (traffic measurement) and Google AdSense (advertising). Third-party cookies may be set by our advertising and affiliate partners including Booking.com, NordVPN, and SafetyWing. You can control cookie preferences through your browser settings.</p>
          </section>

          <section className="content-section">
            <h2>Affiliate Disclosures</h2>
            <p>IsItSafeToVisit.com participates in affiliate programs including Booking.com (via Awin), NordVPN, and SafetyWing. When you click affiliate links and make a purchase, we may earn a commission at no additional cost to you. Affiliate relationships do not influence our safety ratings or recommendations.</p>
          </section>

          <section className="content-section">
            <h2>Third-Party Services</h2>
            <p>We use the following third-party services: Google Analytics for traffic analysis, Google AdSense for advertising, Vercel for hosting, and Mailchimp for email newsletter delivery. Each of these services has its own privacy policy governing how they handle data.</p>
          </section>

          <section className="content-section">
            <h2>Data Security</h2>
            <p>Our website is served over HTTPS encryption. We do not store sensitive personal data on our servers. All data processing is handled by our trusted third-party service providers.</p>
          </section>

          <section className="content-section">
            <h2>Your Rights</h2>
            <p>You may request deletion of any personal data we hold by contacting us at hello@isitsafetovisit.com. You can unsubscribe from our newsletter at any time using the unsubscribe link in any email. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on.</p>
          </section>

          <section className="content-section">
            <h2>Contact</h2>
            <p>For privacy-related questions, contact us at <strong>hello@isitsafetovisit.com</strong>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
