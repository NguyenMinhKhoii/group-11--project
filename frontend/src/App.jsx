import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import ShareData from "./pages/ShareData";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UploadAvatar from "./pages/UploadAvatar";
import TestRefresh from "./pages/TestRefresh";
import LoginPage from "./features/auth/LoginPage";
import SignupPage from "./features/auth/SignupPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Navbar from "./components/Navbar";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorPanel from "./pages/ModeratorPanel";
import RBACDemo from "./pages/RBACDemo";
import { ROLES } from "./utils/rbac";

function App() {
  return (
    <div>
      {/* Bootstrap-based Navigation */}
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes - All authenticated users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload-avatar" 
          element={
            <ProtectedRoute>
              <UploadAvatar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/share-data" 
          element={
            <ProtectedRoute>
              <ShareData />
            </ProtectedRoute>
          } 
        />

        {/* Moderator Routes */}
        <Route 
          path="/moderator/panel" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.MODERATOR, ROLES.ADMIN]}>
                <ModeratorPanel />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/moderator/reports" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.MODERATOR, ROLES.ADMIN]}>
                <ModeratorPanel />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/moderator/content" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.MODERATOR, ROLES.ADMIN]}>
                <ModeratorPanel />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminUsers />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/roles" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/system" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Legacy Routes for backward compatibility */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminUsers />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Test Routes */}
        <Route 
          path="/test/refresh-token" 
          element={
            <ProtectedRoute>
              <TestRefresh />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/test/rbac" 
          element={
            <ProtectedRoute>
              <RBACDemo />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
