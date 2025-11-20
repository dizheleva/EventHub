import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { EventsPage } from "@/pages/EventsPage"
import { Features } from "@/components/home/Features"

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <>
              <HomePage />
              <Features />
            </>
          } />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </Layout>
    </Router>    
  )
}