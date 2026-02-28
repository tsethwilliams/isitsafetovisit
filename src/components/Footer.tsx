import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">IsItSafeTo<span>Visit</span></Link>
            <p>Honest, researched travel safety information for independent travelers. We help you know what to expect — so you can explore with confidence.</p>
          </div>
          <div className="footer-col">
            <h4>Popular Cities</h4>
            <ul>
              <li><Link href="/cities/medellin">Medellín</Link></li>
              <li><Link href="/cities/bangkok">Bangkok</Link></li>
              <li><Link href="/cities/istanbul">Istanbul</Link></li>
              <li><Link href="/cities/mexico-city">Mexico City</Link></li>
              <li><Link href="/cities/cape-town">Cape Town</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Topics</h4>
            <ul>
              <li><Link href="/topics/scams">Common Scams</Link></li>
              <li><Link href="/topics/neighborhoods">Safe Neighborhoods</Link></li>
              <li><Link href="/topics/solo-female">Solo Female Travel</Link></li>
              <li><Link href="/topics/customs">Local Customs</Link></li>
              <li><Link href="/topics/night-safety">Night Safety</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/methodology">Our Methodology</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Use</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 IsItSafeToVisit.com. All rights reserved.</span>
          <span>Travel safe. Travel smart.</span>
        </div>
      </div>
    </footer>
  );
}
