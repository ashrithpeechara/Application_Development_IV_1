'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.scss';
import { Activity, LayoutDashboard, Cpu, Network, Brain, MessageSquareShare, ScrollText, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Agents', href: '/agents', icon: Cpu },
    { label: 'Topology', href: '/network', icon: Network },
    { label: 'Cognitive Engine', href: '/cognitive', icon: Brain },
    { label: 'A2A Bus', href: '/a2a', icon: MessageSquareShare },
    { label: 'Logs', href: '/logs', icon: ScrollText },
    { label: 'Admin', href: '/admin', icon: Settings },
  ];



  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.leftSection}>
          <Link href="/dashboard" className={styles.brand}>
            <div className={styles.brandLogo}>
              <Activity size={18} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.title}>C-ASA</span>
              <span className={styles.subtitle}>Control Center</span>
            </div>
          </Link>

          <div className={styles.divider} />

          <nav className={styles.navLinks}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.systemStatus}>
            <span className="pulsing-dot success" />
            <span className={styles.statusText}>System Online</span>
          </div>
          <span className="badge badge-warning">SIMULATION</span>
        </div>
      </div>
    </header>
  );
};



