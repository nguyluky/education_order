import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import { AuthProvider, useAuth } from './contexts/auth/AuthContext';

// Import page components
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/common/HomePage';
import SubjectsPage from './pages/courses/SubjectsPage';
import EducatorsPage from './pages/educators/EducatorsPage';
import ProfilePage from './pages/profile/ProfilePage';
import SessionsPage from './pages/sessions/SessionsPage';

// Temporary placeholder component for pages that aren't implemented yet
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-10">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">This page is under construction.</p>
  </div>
);

// Protected route component to restrict access based on authentication
const ProtectedRoute: React.FC<{ 
  element: React.ReactNode,
  allowedRoles?: string[]
}> = ({ element, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/" />;
  }
  
  return <>{element}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Student-only routes */}
            <Route 
              path="/educators" 
              element={
                <ProtectedRoute 
                  element={<EducatorsPage />}
                  allowedRoles={['student']} 
                />
              } 
            />
            
            {/* Educator-only routes */}
            <Route 
              path="/earnings" 
              element={
                <ProtectedRoute 
                  element={<PlaceholderPage title="My Earnings" />}
                  allowedRoles={['educator']} 
                />
              } 
            />
            
            {/* Authenticated routes (for both students and educators) */}
            <Route 
              path="/profile" 
              element={<ProtectedRoute element={<ProfilePage />} />} 
            />
            <Route 
              path="/sessions" 
              element={<ProtectedRoute element={<SessionsPage />} />} 
            />
            <Route 
              path="/subjects" 
              element={<ProtectedRoute element={<SubjectsPage />} />} 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<PlaceholderPage title="Page Not Found (404)" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
