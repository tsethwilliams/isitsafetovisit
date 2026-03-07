'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          IsItSafeToVisit
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/cities" className={pathname?.startsWith('/cities') ? 'nav-link active' : 'nav-link'}>
              Cities
            </Link>
          </li>
          <li>
            <Link href="/regions" className={pathname === '/regions' ? 'nav-link active' : 'nav-link'}>
              Regions
            </Link>
          </li>
          <li>
            <Link href="/scams" className={pathname === '/scams' ? 'nav-link active' : 'nav-link'}>
              Scams Guide
            </Link>
          </li>
          <li>
            <Link href="/about" className={pathname === '/about' ? 'nav-link active' : 'nav-link'}>
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
