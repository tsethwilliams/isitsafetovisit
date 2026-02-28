import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-logo">
          IsItSafeTo<span>Visit</span>
        </Link>
        <ul className="nav-links">
          {['Cities', 'Regions', 'Scams', 'About'].map(link => (
            <li key={link}>
              <Link href={`/${link.toLowerCase()}`}>{link}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
