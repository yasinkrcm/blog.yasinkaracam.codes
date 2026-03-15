'use client';

import { motion } from 'framer-motion';
import { Terminal, Code, Cpu } from 'lucide-react';

interface AboutSectionProps {
  locale: string;
}

export function AboutSection({ locale }: AboutSectionProps) {
  const isTr = locale === 'tr';

  return (
    <section id="about" className="px-4 max-w-7xl mx-auto w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium mb-6">
            <Terminal className="w-4 h-4" />
            Hello World!
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {isTr ? (
              <>Bir yazılım geliştirici olarak <span className="text-primary">sistemleri inşa etmeyi</span> ve <span className="text-gradient">öğrendiklerimi</span> paylaşmayı seviyorum.</>
            ) : (
              <>As a software developer, I love <span className="text-primary">building systems</span> and sharing what I <span className="text-gradient">learn</span>.</>
            )}
          </h2>

          <p className="text-lg text-muted-foreground mb-8 text-balance">
            {isTr 
              ? "Merhaba! Ben Yasin Karacam, yıllardır web teknolojileri üzerinde çalışıyorum. Modern web'in inceliklerine, performans optimizasyonuna ve sistem mimarisine tutkuyla bağlıyım."
              : "Hello! I'm Yasin Karacam. I've been working with web technologies for years. I am passionate about the intricacies of the modern web, performance optimization, and system architecture."}
          </p>

          <div className="flex gap-4">
            <div className="glass p-4 rounded-xl flex items-center gap-4">
              <Code className="w-8 h-8 text-primary" />
              <div>
                <strong className="block text-foreground text-lg">Frontend</strong>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Next.js, React</span>
              </div>
            </div>
            <div className="glass p-4 rounded-xl flex items-center gap-4">
              <Cpu className="w-8 h-8 text-fuchsia-500" />
              <div>
                <strong className="block text-foreground text-lg">Backend</strong>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Node.js, Typescript</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] md:h-[500px] glass rounded-[2rem] border border-white/10 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-fuchsia-500/20" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-sm group-hover:blur-none grayscale group-hover:grayscale-0" />
          
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <div className="glass p-4 rounded-xl backdrop-blur-md border border-white/10 w-fit">
              <p className="font-mono text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {isTr ? "Sistem Aktif & Çalışıyor" : "System Active & Running"}
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
