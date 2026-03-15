'use client';

import ProtectedRoute from '@/components/admin/ProtectedRoute';
import PostList from '@/components/admin/PostList';

export default function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <PostList locale="tr" />
      </div>
    </ProtectedRoute>
  );
}
