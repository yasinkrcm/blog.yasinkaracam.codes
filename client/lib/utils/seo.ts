export interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  canonical?: string;
  alternate?: { locale: string; url: string }[];
}

export function generateMetadata({
  title,
  description,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  canonical,
  alternate,
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';
  const siteName = 'Yasin Karacam Blog';
  const defaultTitle = title || siteName;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = description || 'Yazılım geliştirme, web teknolojileri ve daha fazlası hakkında blog yazıları';

  const metadata: any = {
    title: fullTitle,
    description: defaultDescription,
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    openGraph: {
      type: ogType,
      locale: 'tr_TR',
      url: canonical || siteUrl,
      title: defaultTitle,
      description: defaultDescription,
      siteName: siteName,
      images: ogImage
        ? [
            {
              url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
              width: 1200,
              height: 630,
              alt: defaultTitle,
            },
          ]
        : [],
    },
    twitter: {
      card: twitterCard,
      title: defaultTitle,
      description: defaultDescription,
      images: ogImage
        ? [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`]
        : [],
    },
  };

  if (canonical) {
    metadata.alternates = {
      canonical: canonical,
      languages: alternate
        ? alternate.reduce((acc, alt) => {
            acc[alt.locale] = alt.url;
            return acc;
          }, {} as Record<string, string>)
        : {},
    };
  }

  return metadata;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function formatDate(date: string, locale: string = 'tr'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateJsonLd(type: string, data: any) {
  const baseJsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(baseJsonLd);
}
