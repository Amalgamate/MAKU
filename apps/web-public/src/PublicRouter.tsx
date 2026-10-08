import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { Spinner } from '@maku/ui';

const HomePage = lazy(() => import('./pages/HomePage'));
const ImpactPage = lazy(() => import('./pages/ImpactPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const LocationPage = lazy(() => import('./pages/LocationPage'));
const FindMAKUPage = lazy(() => import('./pages/FindMAKUPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function PublicRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/find-maku" element={<FindMAKUPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
