interface TwitterCardProps {
  title: string;
  description: string;
  cardImage?: string;
  cardType?: 'summary' | 'summary_large_image';
}

export default function TwitterCard({
  title,
  description,
  cardImage,
  cardType = 'summary_large_image',
}: TwitterCardProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.yasinkaracam.codes';
  const fullImageUrl = cardImage?.startsWith('http')
    ? cardImage
    : cardImage
    ? `${siteUrl}${cardImage}`
    : null;

  return (
    <>
      <meta name="twitter:card" content={cardType} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {fullImageUrl && (
        <meta name="twitter:image" content={fullImageUrl} />
      )}
    </>
  );
}
