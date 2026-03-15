import { notFound } from 'next/navigation';
import { getBlogPostsByTag, getAllTags } from '@/lib/cms/api-client';
import { Metadata } from 'next';
import BlogList from '@/components/blog/BlogList';
import JsonLd from '@/components/seo/JsonLd';

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags('tr');
  const tagsEn = await getAllTags('en');

  const paths = [
    ...tags.map((tag) => ({ locale: 'tr', tag })),
    ...tagsEn.map((tag) => ({ locale: 'en', tag })),
  ];

  return paths;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';

  return {
    title: `${tag} - Blog`,
    description: `Posts tagged with ${tag}`,
    alternates: {
      canonical: `${siteUrl}/${locale === 'tr' ? '' : locale + '/'}blog/tag/${tag}`,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `${siteUrl}/${locale === 'tr' ? '' : locale + '/'}blog/tag/${tag}`,
      title: `${tag} - Blog`,
      description: `Posts tagged with ${tag}`,
    },
  };
}

export default async function TagPage({
  params,
}: TagPageProps) {
  const { locale, tag } = await params;
  const posts = await getBlogPostsByTag(decodeURIComponent(tag), locale);

  if (posts.length === 0) {
    notFound();
  }

  const jsonLd = {
    '@type': 'CollectionPage',
    name: `Posts tagged with ${tag}`,
    description: `Blog posts tagged with ${tag}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/tag/${tag}`,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {tag}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
        </p>

        <BlogList posts={posts} locale={locale} />
      </div>
    </>
  );
}
