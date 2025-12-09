import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { EventsPage } from "@/pages/EventsPage"
import { EventDetails } from "@/pages/EventDetails"
import { MyEventsPage } from "@/pages/MyEventsPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { UserProfilePage } from "@/pages/profile/UserProfilePage"
import { EditProfilePage } from "@/pages/profile/EditProfilePage"
import { FavoritesPage } from "@/pages/FavoritesPage"
import { Features } from "@/components/home/Features"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { GuestRoute } from "@/components/auth/GuestRoute"

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
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <FavoritesPage />
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
  // isAuthReady is now always true immediately in AuthContext
  // No need to check it here - routes will handle their own loading states

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <AppRoutes />
      </Layout>
      {/* Global Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>    
  )
}