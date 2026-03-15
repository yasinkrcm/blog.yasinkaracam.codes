interface OpenGraphProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  url: string;
  siteName?: string;
}

export default function OpenGraph({
  title,
  description,
  ogImage,
  ogType = 'website',
  url,
  siteName = 'Yasin Karacam Blog',
}: OpenGraphProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';
  const fullImageUrl = ogImage?.startsWith('http')
    ? ogImage
    : ogImage
    ? `${siteUrl}${ogImage}`
    : null;

  return (
    <>
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      {fullImageUrl && (
        <>
          <meta property="og:image" content={fullImageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={title} />
        </>
      )}
    </>
  );
}
