'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/routing';
import { Link } from '@/lib/i18n/routing';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PenTool, Menu, X, Globe, User, Grid, Star, Mail } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const mainSiteUrl = 'https://yasinkaracam.codes';

  const navItems = [
    {
      label: locale === 'tr' ? 'Ana Sayfa' : 'Home',
      href: `${mainSiteUrl}/${locale}`,
      isExternal: true,
      icon: <Home className="w-4 h-4" />
    },
    {
      label: locale === 'tr' ? 'Hakkımda' : 'About',
      href: `${mainSiteUrl}/${locale}/about`,
      isExternal: true,
      icon: <User className="w-4 h-4" />
    },
    {
      label: locale === 'tr' ? 'Projeler' : 'Projects',
      href: `${mainSiteUrl}/${locale}/projects`,
      isExternal: true,
      icon: <Grid className="w-4 h-4" />
    },
    {
      label: locale === 'tr' ? 'Yetenekler' : 'Skills',
      href: `${mainSiteUrl}/${locale}/skills`,
      isExternal: true,
      icon: <Star className="w-4 h-4" />
    },
    {
      label: locale === 'tr' ? 'İletişim' : 'Contact',
      href: `${mainSiteUrl}/${locale}/contact`,
      isExternal: true,
      icon: <Mail className="w-4 h-4" />
    },
    {
      label: locale === 'tr' ? 'Blog' : 'Blog',
      href: '/',
      isExternal: false,
      icon: <PenTool className="w-4 h-4" />
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pt-4 sm:pt-6 transition-all duration-500">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-5xl transition-all duration-300 rounded-full px-6 h-14 sm:h-16 flex items-center justify-between border ${isScrolled
            ? 'glass shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-white/10 dark:border-white/5 bg-background/60 dark:bg-black/40 backdrop-blur-xl'
            : 'border-transparent bg-transparent'
          }`}
      >
        {/* Logo */}
        <Link href="/" className="relative group flex items-center gap-2 z-20">
          <span className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/30 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></span>
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={28}
            height={28}
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = !item.isExternal && (pathname === item.href || pathname.startsWith(`${item.href}/`));

            if (item.isExternal) {
              return (
                <li key={item.label} className="relative">
                  <a
                    href={item.href}
                    className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 z-10 text-muted-foreground hover:text-white"
                  >
                    <span className="transition-transform duration-300">
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                </li>
              );
            }

            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 z-10
                    ${isActive ? 'text-white' : 'text-muted-foreground hover:text-white'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/10 backdrop-blur-md -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ boxShadow: "var(--glow-primary)" }}
                    />
                  )}
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 z-20">
          {/* Language Switcher - Desktop */}
          <div className="hidden md:flex items-center bg-black/20 dark:bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
            {['tr', 'en'].map((loc) => {
              const isActive = locale === loc;
              return (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`relative px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-muted-foreground hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-lang-indicator"
                      className="absolute inset-0 rounded-full bg-primary/20 border border-primary/50 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span>{loc === 'en' ? 'EN' : 'TR'}</span>
                </button>
              )
            })}
          </div>

          {/* Mobile Menu Button  */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full glass hover:bg-white/10 transition-colors relative z-50 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-4 p-4 md:hidden glass-panel rounded-3xl mx-4 border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50 pointer-events-none" />
              <ul className="space-y-2 relative z-10">
                {navItems.map((item) => {
                  const isActive = !item.isExternal && (pathname === item.href || pathname.startsWith(`${item.href}/`));

                  if (item.isExternal) {
                    return (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-muted-foreground hover:bg-white/5 hover:text-white"
                        >
                          <span>{item.icon}</span>
                          {item.label}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive
                            ? 'bg-white/10 text-white border border-white/10 shadow-[var(--glow-primary)]'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        <span className={isActive ? 'text-primary' : ''}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Mobile Language Switcher */}
              <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between px-4 py-2 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{locale === 'tr' ? 'Dil' : 'Language'}</span>
                  </div>
                  <div className="flex gap-1 bg-black/40 p-1 rounded-full">
                    {['tr', 'en'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          switchLocale(loc);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${locale === loc
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-muted-foreground hover:text-white'
                          }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
