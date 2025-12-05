import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { EventsPage } from "@/pages/EventsPage"
import { EventDetails } from "@/pages/EventDetails"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { Features } from "@/components/home/Features"

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={
            <>
              <HomePage />
              <Features />
            </>
          } />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </Router>    
  )
}