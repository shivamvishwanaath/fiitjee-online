import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';

interface StudentProtectedRouteProps {
  children: React.ReactNode;
}

export const StudentProtectedRoute: React.FC<StudentProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useStudentAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <FiitjeeLogo variant="dark" size="md" />
        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-4 h-4 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" />
          <span>Verifying student session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/student/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};
