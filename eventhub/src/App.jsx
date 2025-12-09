import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import EventDetails from "@/pages/EventDetails";
import MyEventsPage from "@/pages/MyEventsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import UserProfilePage from "@/pages/profile/UserProfilePage";
import EditProfilePage from "@/pages/profile/EditProfilePage";
import FavoritesPage from "@/pages/FavoritesPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuestRoute from "@/components/auth/GuestRoute";

export default function App() {
  return (
    <>
      <Navbar />
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/my-events" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/profile/:userId/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />            
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      </Routes>
      <Footer />
    </>
  );
}