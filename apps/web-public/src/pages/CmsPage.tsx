import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCmsPage } from '../hooks/useWebsiteCms';
import { BlockRenderer } from '../components/BlockRenderer';

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-8">
      <div className="h-64 bg-gray-200 rounded-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function CmsPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { page, isLoading } = useCmsPage(slug);

  // Update <title> and meta description from SEO fields
  useEffect(() => {
    if (!page) return;
    document.title = page.seoTitle || page.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta && page.seoDescription) meta.content = page.seoDescription;
  }, [page]);

  if (isLoading) return <PageSkeleton />;

  // No matching CMS page → let the app fall through to its 404 or static page
  if (!page) return <Navigate to="/" replace />;

  return (
    <>
      {page.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
      {page.blocks.length === 0 && (
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>
          <p className="text-gray-400">This page has no content yet.</p>
        </div>
      )}
    </>
  );
}
