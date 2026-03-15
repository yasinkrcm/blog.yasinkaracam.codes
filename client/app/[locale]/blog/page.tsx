import { getAllBlogPosts } from '@/lib/cms/api-client';
import { Metadata } from 'next';
import BlogList from '@/components/blog/BlogList';
import Pagination from '@/components/blog/Pagination';
import JsonLd from '@/components/seo/JsonLd';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';

  return {
    title: locale === 'tr' ? 'Blog' : 'Blog',
    description:
      locale === 'tr'
        ? 'Yazılım geliştirme, web teknolojileri ve daha fazlası hakkında blog yazıları'
        : 'Blog posts about software development, web technologies, and more',
    alternates: {
      canonical: `${siteUrl}/${locale === 'tr' ? '' : locale + '/'}blog`,
      languages: {
        tr: `${siteUrl}/blog`,
        en: `${siteUrl}/en/blog`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `${siteUrl}/${locale === 'tr' ? '' : locale + '/'}blog`,
      title: locale === 'tr' ? 'Blog' : 'Blog',
      description:
        locale === 'tr'
          ? 'Yazılım geliştirme, web teknolojileri ve daha fazlası hakkında blog yazıları'
          : 'Blog posts about software development, web technologies, and more',
    },
  };
}

const POSTS_PER_PAGE = 9;

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const { locale } = await params;
  const { page } = await searchParams;

  const posts = await getAllBlogPosts(locale);

  const currentPage = parseInt(page || '1', 10);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const jsonLd = {
    '@type': 'Blog',
    name: locale === 'tr' ? 'Blog' : 'Blog',
    description:
      locale === 'tr'
        ? 'Yazılım geliştirme, web teknolojileri ve daha fazlası hakkında blog yazıları'
        : 'Blog posts about software development, web technologies, and more',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog`,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
    blogPost: currentPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.fields.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${post.fields.slug}`,
      datePublished: post.fields.publishedDate,
      description: post.fields.excerpt,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">
          <span className="text-gradient-primary">
            {locale === 'tr' ? 'Blog' : 'Blog'}
          </span>
        </h1>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {locale === 'tr' ? 'Yazı bulunamadı' : 'No posts found'}
            </p>
          </div>
        ) : (
          <>
            <BlogList posts={currentPosts} locale={locale} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              locale={locale}
              basePath="/blog"
            />
          </>
        )}
      </div>
    </>
  );
}
