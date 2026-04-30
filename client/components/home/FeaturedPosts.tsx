'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/lib/i18n/routing';
import { ArrowUpRight } from 'lucide-react';

import { BlogPost } from '@/lib/cms/api-client';

interface FeaturedPostsProps {
  locale: string;
  posts: BlogPost[];
}

export function FeaturedPosts({ locale, posts }: FeaturedPostsProps) {
  const isTr = locale === 'tr';

  if (!posts || posts.length === 0) {
    return null;
  }

  // Layout and styling helpers for up to 3 posts in the bento grid
  const layoutHelpers = [
    { colSpan: "col-span-1 md:col-span-2 md:row-span-2", gradient: "from-blue-600/20 to-purple-600/20" },
    { colSpan: "col-span-1 md:col-span-1", gradient: "from-emerald-500/20 to-teal-500/20" },
    { colSpan: "col-span-1 md:col-span-1", gradient: "from-orange-500/20 to-red-500/20" },
  ];


  return (
    <section className="px-4 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
            {isTr ? "Son Yazılar" : "Latest Posts"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isTr ? "En son paylaşımlarıma göz atın." : "Check out my latest insights."}
          </p>
        </div>
        <Link href="/blog" className="hidden md:flex items-center gap-2 text-primary hover:text-white transition-colors group">
          {isTr ? "Tümünü Gör" : "View All"}
          <ArrowUpRight className="w-5 h-5 group-hover:translate-y(-1) group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        {posts.map((post, i) => {
          const layout = layoutHelpers[i % layoutHelpers.length];
          const formattedDate = new Date(post.fields.publishedDate || post.sys.publishedAt).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          const category = post.fields.tags && post.fields.tags.length > 0 ? post.fields.tags[0] : "Blog";
          
          return (
            <Link 
              href={`/blog/${post.fields.slug}`} 
              key={post.sys.id} 
              className="contents" // We use contents to allow the motion.div to dictate layout
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass-panel overflow-hidden group relative p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[var(--glow-secondary)] transition-all duration-300 cursor-pointer ${layout.colSpan}`}
              >
                {post.fields.featuredImage ? (
                  <>
                    <Image
                      src={post.fields.featuredImage}
                      alt={post.fields.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 transition-all duration-500" />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${layout.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                )}
                
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-black/40 text-xs font-semibold text-white/90 tracking-wider border border-white/10 backdrop-blur-md">
                    {category}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 group-hover:rotate-45">
                     <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <p className="text-sm text-muted-foreground mb-3">{formattedDate}</p>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.fields.title}
                  </h3>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-8 md:hidden flex justify-center">
        <Link href="/blog" className="glass px-6 py-3 rounded-full flex items-center gap-2 text-foreground font-medium">
          {isTr ? "Tümünü Gör" : "View All"}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
