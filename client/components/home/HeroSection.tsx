'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const isTr = locale === 'tr';

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-16">

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <span className="inline-block py-1.5 px-4 rounded-full glass border border-primary/20 text-primary text-sm font-medium tracking-wide shadow-[var(--glow-primary)]">
          {isTr ? 'Yeni Nesil Web Teknolojileri' : 'Next-Gen Web Technologies'}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-balance mb-6"
      >
        <span className="block text-gradient">Create Beyond</span>
        <span className="block">Expectations</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg md:text-2xl text-muted-foreground max-w-2xl text-balance mb-12"
      >
        {isTr
          ? "Modern web geliştirme, yazılım mimarileri ve dijital ekosistem üzerine derinlemesine analizler ve deneyimler."
          : "In-depth analysis and experiences on modern web development, software architectures, and the digital ecosystem."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 sm:gap-6"
      >
        <Link
          href="/blog"
          className="group relative px-8 py-4 rounded-full bg-primary text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(124,58,237,0.5)]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative flex items-center justify-center gap-2">
            {isTr ? "Blogu Keşfet" : "Explore Articles"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
        <Link
          href="https://yasinkaracam.codes/"
          className="group px-8 py-4 rounded-full glass text-foreground font-bold text-lg transition-all hover:bg-white/10 hover:shadow-lg"
        >
          {isTr ? "Ben Kimim?" : "Who Am I?"}
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce"
      >
        <span className="text-xs uppercase tracking-widest">{isTr ? 'Aşağı Kaydır' : 'Scroll Down'}</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}
