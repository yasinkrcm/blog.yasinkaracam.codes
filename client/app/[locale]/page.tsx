import { Link } from '@/lib/i18n/routing';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedPosts } from '@/components/home/FeaturedPosts';
import { AboutSection } from '@/components/home/AboutSection';
import { getAllBlogPosts } from '@/lib/cms/api-client';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';

  return {
    title: 'Yasin Karacam — Full Stack Developer & Tech Blogger',
    description: locale === 'tr' 
      ? 'Yazılım geliştirme tutkunu. Modern web teknolojileri, sistem mimarisi ve kodlama üzerine derinlemesine yazılar.' 
      : 'Passionate about software development. In-depth articles on modern web technologies, system architecture, and coding.',
    alternates: {
      canonical: `${siteUrl}/${locale === 'tr' ? '' : locale}`,
      languages: {
        tr: `${siteUrl}`,
        en: `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `${siteUrl}/${locale === 'tr' ? '' : locale}`,
      title: 'Yasin Karacam — Full Stack Developer & Tech Blogger',
      description: locale === 'tr'
        ? 'Yazılım geliştirme tutkunu. Modern web teknolojileri, sistem mimarisi ve kodlama üzerine derinlemesine yazılar.'
        : 'Passionate about software development. In-depth articles on modern web technologies, system architecture, and coding.',
      siteName: 'Yasin Karacam',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Yasin Karacam Blog',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Yasin Karacam — Full Stack Developer & Tech Blogger',
      description: locale === 'tr'
        ? 'Yazılım geliştirme tutkunu. Modern web teknolojileri, sistem mimarisi ve kodlama üzerine derinlemesine yazılar.'
        : 'Passionate about software development. In-depth articles on modern web technologies, system architecture, and coding.',
      images: [`${siteUrl}/twitter-image.jpg`],
    }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  
  // Fetch actual blog posts
  const allPosts = await getAllBlogPosts(locale);
  const featuredPosts = allPosts.slice(0, 3);

  const jsonLd = {
    '@type': 'WebSite',
    name: 'Yasin Karacam Blog',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description: locale === 'tr' 
      ? 'Yazılım geliştirme tutkunu. Modern web teknolojileri, sistem mimarisi ve kodlama üzerine derinlemesine yazılar.' 
      : 'Passionate about software development. In-depth articles on modern web technologies, system architecture, and coding.',
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      
      {/* Abstract Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex flex-col gap-24 md:gap-32 pb-24">
        {/* We moved the sections into separate client components since they'll use framer-motion heavily.
            For now, if they don't exist, we will create them. */}
        <HeroSection locale={locale} />
        <FeaturedPosts locale={locale} posts={featuredPosts} />
        <AboutSection locale={locale} />
      </div>
    </>
  );
}
