import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/cms/api-client';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, calculateReadingTime } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const postsTr = await getAllBlogPosts('tr');
  const postsEn = await getAllBlogPosts('en');

  const paths = [
    ...postsTr.map((post) => ({ locale: 'tr', slug: post.fields.slug })),
    ...postsEn.map((post) => ({ locale: 'en', slug: post.fields.slug })),
  ];

  return paths;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';
  const { title, excerpt, featuredImage } = post.fields;
  const imageUrl = featuredImage || null;

  return {
    title: title,
    description: excerpt,
    alternates: {
      canonical: `${siteUrl}/${locale === 'tr' ? '' : locale + '/'}blog/${slug}`,
      languages: {
        tr: `${siteUrl}/blog/${slug}`,
        en: `${siteUrl}/en/blog/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `${siteUrl}/${locale === 'tr' ? '' : locale + '/'}blog/${slug}`,
      title: title,
      description: excerpt,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      publishedTime: post.fields.publishedDate,
      authors: ['Yasin Karacam'],
    },
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const {
    title,
    content,
    excerpt,
    tags,
    publishedDate,
    featuredImage,
  } = post.fields;

  const imageUrl = featuredImage || null;

  const readingTime = calculateReadingTime(excerpt);

  const jsonLd = {
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt,
    image: imageUrl || undefined,
    datePublished: publishedDate,
    dateModified: post.sys.publishedAt,
    author: {
      '@type': 'Person',
      name: 'Yasin Karacam',
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Yasin Karacam Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${slug}`,
    },
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="glass-panel relative z-10 mx-auto max-w-4xl px-6 sm:px-10 lg:px-12 py-12 mt-12 mb-24">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-8 group font-medium"
        >
          <svg
            className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {locale === 'tr' ? 'Listeye Dön' : 'Back to List'}
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time dateTime={publishedDate || ''}>
                {formatDate(publishedDate || '', locale)}
              </time>
            </div>

            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{readingTime} {locale === 'tr' ? 'dakika' : 'minutes'}</span>
            </div>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${locale}/blog/tag/${tag}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {imageUrl && (
          <figure className="mb-10">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </figure>
        )}

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />

        <footer className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {locale === 'tr' ? 'Yazar:' : 'Author:'}{' '}
              <span className="font-medium text-foreground">
                Yasin Karacam
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Share:
              </span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}
