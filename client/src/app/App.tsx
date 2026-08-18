import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../pages/HomePage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { PersonDetailPage } from '../pages/PersonDetailPage';

const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('../pages/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes default
      refetchOnWindowFocus: false,
    },
  },
});

const RouteLoader: React.FC = () => (
  <div className="min-h-screen bg-atlas-bg flex items-center justify-center font-mono text-xs text-atlas-brass animate-pulse">
    Loading module...
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history/:slug" element={<EventDetailPage />} />
            <Route path="/history/people/:slug" element={<PersonDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
