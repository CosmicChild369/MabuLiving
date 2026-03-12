import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { pagesConfig } from "@/pages.config";

function AppRoutes() {
  const location = useLocation();
  const currentPageName = location.pathname.replace(/^\//, "") || pagesConfig.mainPage;
  const Layout = pagesConfig.Layout;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${pagesConfig.mainPage}`} replace />} />
      {Object.entries(pagesConfig.Pages).map(([name, Page]) => (
        <Route
          key={name}
          path={`/${name}`}
          element={Layout ? <Layout currentPageName={name}><Page /></Layout> : <Page />}
        />
      ))}
      <Route path="*" element={<Navigate to={`/${pagesConfig.mainPage}`} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  );
}
