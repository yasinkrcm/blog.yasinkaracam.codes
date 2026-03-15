import { BlogPost } from '@/lib/cms/api-client';
import BlogCard from './BlogCard';

interface BlogListProps {
  posts: BlogPost[];
  locale: string;
}

export default function BlogList({ posts, locale }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No blog posts found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.sys.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
