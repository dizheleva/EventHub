import { Navbar } from "./Navbar"
import { Heart } from "lucide-react"

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30 text-gray-900">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Създадено с <Heart className="inline w-4 h-4 text-primary fill-primary" /> за всички
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} EventHub. Всички права запазени.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}