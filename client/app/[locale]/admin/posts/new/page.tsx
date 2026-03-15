'use client';

import { use } from 'react';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Create New Post
        </h1>
        <PostForm locale={locale} />
      </div>
    </ProtectedRoute>
  );
}
