import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';

const HomePage       = lazy(() => import('./pages/HomePage'));
const ImpactPage     = lazy(() => import('./pages/ImpactPage'));
const PartnersPage   = lazy(() => import('./pages/PartnersPage'));
const LocationPage   = lazy(() => import('./pages/LocationPage'));
const FindMAKUPage   = lazy(() => import('./pages/FindMAKUPage'));
const RegisterPage   = lazy(() => import('./pages/RegisterPage'));
// Dynamic CMS page — handles any /:slug not matched by a static route above
const CmsPage        = lazy(() => import('./pages/CmsPage'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-brand-700 border-t-transparent animate-spin" />
    </div>
  );
}

export function PublicRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Static routes — matched before the CMS catch-all */}
          <Route index element={<HomePage />} />
          <Route path="/impact"    element={<ImpactPage />} />
          <Route path="/partners"  element={<PartnersPage />} />
          <Route path="/location"  element={<LocationPage />} />
          <Route path="/find-maku" element={<FindMAKUPage />} />
          <Route path="/register"  element={<RegisterPage />} />

          {/* CMS-managed pages: any slug not matched above */}
          <Route path="/:slug" element={<CmsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
