import { useTranslations } from 'next-intl';
import { Github, Linkedin } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pb-10 border-t border-white/10 glass bg-transparent z-10">
      {/* Top glowing line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[var(--glow-primary)]"></div>

      <div className="mx-auto max-w-7xl px-6 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="font-bold text-xl tracking-tight text-gradient-primary">
              Yasin<span className="text-foreground">Karacam</span>
            </span>
            <div className="text-muted-foreground text-sm opacity-80">
              {t('copyright', { year: currentYear })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com/yasinkrcm" target="_blank" rel="noreferrer" className="p-2.5 rounded-full glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/yasin-karacamm/" target="_blank" rel="noreferrer" className="p-2.5 rounded-full glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="text-muted-foreground text-xs font-mono tracking-widest uppercase opacity-60">
            {t('builtWith')}
          </div>
        </div>
      </div>
    </footer>
  );
}
