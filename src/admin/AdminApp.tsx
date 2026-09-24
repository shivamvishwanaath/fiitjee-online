import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { RegistrationsList } from './pages/RegistrationsList';
import { RegistrationDetail } from './pages/RegistrationDetail';
import { AddRegistration } from './pages/AddRegistration';
import { CouponList } from './pages/CouponList';
import { CouponCreate } from './pages/CouponCreate';
import { CouponDetail } from './pages/CouponDetail';
import { CRMDashboard } from './pages/CRMDashboard';
import { CRMContacts } from './pages/CRMContacts';
import { CRMCompose } from './pages/CRMCompose';
import { CRMCampaigns } from './pages/CRMCampaigns';
import { CRMFollowUps } from './pages/CRMFollowUps';
import { CRMTickets } from './pages/CRMTickets';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

export const AdminApp: React.FC = () => {
  return (
    <Routes>
      {/* Public Admin Login Route */}
      <Route path="login" element={<AdminLogin />} />

      {/* Protected Routes inside AdminLayout */}
      <Route
        path=""
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="registrations"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <RegistrationsList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="registrations/:rollNo"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <RegistrationDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="registrations/add"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddRegistration />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Coupon Codes Routes */}
      <Route
        path="coupons"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CouponList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="coupons/create"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CouponCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="coupons/:couponId"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CouponDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Admissions CRM Routes */}
      <Route
        path="crm"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CRMDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="crm/contacts"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CRMContacts />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="crm/compose"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CRMCompose />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="crm/campaigns"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CRMCampaigns />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="crm/followups"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CRMFollowUps />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="crm/tickets"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CRMTickets />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminApp;

