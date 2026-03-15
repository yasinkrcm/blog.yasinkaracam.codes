import { postsApi } from '../api';
import { Post } from '../api/types';

export interface BlogPost {
  sys: {
    id: string;
    publishedAt: string;
  };
  fields: {
    title: string;
    slug: string;
    content: {
      json: object;
      html: string;
    };
    excerpt: string;
    tags: string[];
    publishedDate?: string;
    featuredImage?: string;
    locale: string;
  };
}

// Transform API Post to BlogPost format
const transformToBlogPost = (post: Post): BlogPost => {
  return {
    sys: {
      id: post._id,
      publishedAt: post.publishedDate || post.createdAt,
    },
    fields: {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags,
      publishedDate: post.publishedDate,
      featuredImage: post.featuredImage,
      locale: post.locale,
    },
  };
};

export async function getAllBlogPosts(
  locale: string = 'tr',
  preview: boolean = false
): Promise<BlogPost[]> {
  try {
    const response = await postsApi.getAll({
      locale: locale as 'tr' | 'en',
      status: preview ? undefined : 'published',
      limit: 1000,
    });

    return response.posts.map(transformToBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
  locale: string = 'tr',
  preview: boolean = false
): Promise<BlogPost | null> {
  try {
    const response = await postsApi.getBySlug(slug, locale as 'tr' | 'en');
    return transformToBlogPost(response.post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function getBlogPostSlugs(
  locale: string = 'tr'
): Promise<string[]> {
  try {
    const response = await postsApi.getAll({
      locale: locale as 'tr' | 'en',
      status: 'published',
      limit: 1000,
    });

    return response.posts.map((post) => post.slug);
  } catch (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }
}

export async function getBlogPostsByTag(
  tag: string,
  locale: string = 'tr'
): Promise<BlogPost[]> {
  try {
    const response = await postsApi.getAll({
      locale: locale as 'tr' | 'en',
      tag,
      status: 'published',
      limit: 1000,
    });

    return response.posts.map(transformToBlogPost);
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

export async function getAllTags(locale: string = 'tr'): Promise<string[]> {
  try {
    const response = await postsApi.getTags(locale as 'tr' | 'en');
    return response.tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
