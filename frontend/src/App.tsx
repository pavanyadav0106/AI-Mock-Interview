import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { CreateInterview } from './pages/CreateInterview';
import { InterviewSession } from './pages/InterviewSession';
import { Results } from './pages/Results';
import { ResumeEvaluator } from './pages/ResumeEvaluator';
import { Analytics } from './pages/Analytics';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
        <div
          className="min-h-screen flex flex-col"
          style={{ background: 'rgb(var(--bg-primary))' }}
        >
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-interview"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <CreateInterview />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/:id"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <InterviewSession />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results/:id"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <Results />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <Analytics />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-evaluator"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <ResumeEvaluator />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
