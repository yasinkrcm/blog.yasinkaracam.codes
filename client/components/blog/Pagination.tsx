import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  locale,
  basePath,
}: PaginationProps) {
  const t = useTranslations('pagination');

  const getPageUrl = (page: number) => {
    if (page === 1) return `/${locale}${basePath}`;
    return `/${locale}${basePath}/page/${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 my-8">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {t('previous')}
        </Link>
      )}

      {renderPageNumbers().map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-4 py-2 border rounded-md text-sm font-medium ${
            page === currentPage
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {t('next')}
        </Link>
      )}
    </div>
  );
}
