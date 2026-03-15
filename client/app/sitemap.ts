import { MetadataRoute } from 'next';
import { getAllBlogPosts, getBlogPostSlugs, getAllTags } from '@/lib/cms/api-client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';

  // Get all blog posts in both languages
  const postsTr = await getAllBlogPosts('tr');
  const postsEn = await getAllBlogPosts('en');

  // Get all tags
  const tagsTr = await getAllTags('tr');
  const tagsEn = await getAllTags('en');

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Blog posts in Turkish
  const blogUrlsTr: MetadataRoute.Sitemap = postsTr.map((post) => ({
    url: `${siteUrl}/blog/${post.fields.slug}`,
    lastModified: post.fields.publishedDate ? new Date(post.fields.publishedDate) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog posts in English
  const blogUrlsEn: MetadataRoute.Sitemap = postsEn.map((post) => ({
    url: `${siteUrl}/en/blog/${post.fields.slug}`,
    lastModified: post.fields.publishedDate ? new Date(post.fields.publishedDate) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Tag pages in Turkish
  const tagUrlsTr: MetadataRoute.Sitemap = tagsTr.map((tag) => ({
    url: `${siteUrl}/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Tag pages in English
  const tagUrlsEn: MetadataRoute.Sitemap = tagsEn.map((tag) => ({
    url: `${siteUrl}/en/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticUrls,
    ...blogUrlsTr,
    ...blogUrlsEn,
    ...tagUrlsTr,
    ...tagUrlsEn,
  ];
}
