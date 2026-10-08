import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import ChapterDetailPage from './pages/ChapterDetailPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx';
import PaymentFailurePage from './pages/PaymentFailurePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const AppRoutes = () => {
  const { pathname } = useLocation();
  const usePublicShell =
    pathname === '/' ||
    pathname === '/contact' ||
    pathname.startsWith('/chapter/');

  return (
    <div className="flex flex-col min-h-screen">
      {usePublicShell && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chapter/:id" element={<ChapterDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
          <Route path="/payment/:courseId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failure" element={<PaymentFailurePage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route
            path="*"
            element={
              <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                  <p className="text-xl text-muted-foreground mb-6">Page not found</p>
                  <a href="/" className="text-primary hover:underline">Back to home</a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      {usePublicShell && <Footer />}
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
