import { memo } from "react";
import Navbar from "./Navbar"
import Footer from "./Footer"

const Layout = memo(function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30 text-gray-900">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
});

export default Layout;