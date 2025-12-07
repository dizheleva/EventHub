import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { EventsPage } from "@/pages/EventsPage"
import { EventDetails } from "@/pages/EventDetails"
import { MyEventsPage } from "@/pages/MyEventsPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { UserProfilePage } from "@/pages/profile/UserProfilePage"
import { EditProfilePage } from "@/pages/profile/EditProfilePage"
import { Features } from "@/components/home/Features"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { Toast } from "@/components/common/Toast"
import { useAuth } from "@/contexts/AuthContext"

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/" element={
        <>
          <HomePage />
          <Features />
        </>
      } />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetails />} />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/my-events" 
        element={
          <ProtectedRoute>
            <MyEventsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Profile routes - public, but edit button only visible to owner */}
      <Route 
        path="/profile/:userId" 
        element={<UserProfilePage />}
      />
      <Route 
        path="/profile/:userId/edit" 
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Guest routes - only accessible when NOT logged in */}
      <Route 
        path="/login" 
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        } 
      />
    </Routes>
  );
}

export default function App() {
  const { isAuthReady } = useAuth();

  // Show centered loading spinner while auth is initializing
  // This ensures auth state is restored from localStorage before rendering routes
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Зареждане..." />
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <AppRoutes />
      </Layout>
      {/* Global Toast - reads from ToastContext */}
      <Toast />
    </Router>    
  )
}