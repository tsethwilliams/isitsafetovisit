'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    // Mailchimp form submission
    // Replace MAILCHIMP_URL with your actual Mailchimp form action URL
    // To get this: Mailchimp -> Audience -> Signup forms -> Embedded forms -> copy the action URL
    const MAILCHIMP_URL = '';

    if (MAILCHIMP_URL) {
      // Submit to Mailchimp via their embedded form endpoint
      const url = MAILCHIMP_URL.replace('/post?', '/post-json?') + '&EMAIL=' + encodeURIComponent(email);
      const script = document.createElement('script');
      script.src = url + '&c=mailchimpCallback';
      document.body.appendChild(script);
      (window as any).mailchimpCallback = () => {
        setStatus('success');
        setEmail('');
      };
    } else {
      // Placeholder until Mailchimp is configured
      setStatus('success');
      setEmail('');
    }
  }

  if (status === 'success') {
    return (
      <div className="newsletter-success">
        <span className="newsletter-success-icon">{'\u2705'}</span>
        <p>You&apos;re in! Watch your inbox for safety updates.</p>
      </div>
    );
  }

  return (
    <div className="newsletter-form-wrapper">
      <div className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="newsletter-input"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="button" className="newsletter-btn" onClick={handleSubmit}>
          Subscribe
        </button>
      </div>
      <p className="newsletter-disclaimer">Free. No spam. Unsubscribe anytime.</p>
    </div>
  );
}
