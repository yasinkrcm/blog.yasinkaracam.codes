import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/cms/api-client';
import { formatDate, calculateReadingTime } from '@/lib/utils/seo';

interface BlogCardProps {
  post: BlogPost;
  locale: string;
}

export default function BlogCard({ post, locale }: BlogCardProps) {
  const {
    title,
    slug,
    excerpt,
    tags,
    publishedDate,
    featuredImage,
  } = post.fields;

  const imageUrl = featuredImage || null;

  const readingTime = calculateReadingTime(excerpt);

  return (
    <article className="glass-panel flex flex-col overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border border-white/5">
      {imageUrl && (
        <Link href={`/${locale}/blog/${slug}`} className="block relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className="flex-1 flex flex-col p-6 z-10 relative">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <time dateTime={publishedDate || ''}>
            {formatDate(publishedDate || '', locale)}
          </time>
          <span className="mx-2">•</span>
          <span>{readingTime} {locale === 'tr' ? 'dakika' : 'minutes'}</span>
        </div>
        <Link href={`/${locale}/blog/${slug}`} className="block">
          <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>
        <p className="text-muted-foreground mb-5 flex-1 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/${locale}/blog/tag/${tag}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
        <Link
          href={`/${locale}/blog/${slug}`}
          className="inline-flex items-center text-primary group-hover:text-primary/80 font-medium mt-auto"
        >
          {locale === 'tr' ? 'Devamını Oku' : 'Read More'}
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
