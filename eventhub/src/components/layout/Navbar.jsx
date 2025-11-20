import { useState } from "react"
import { CalendarDays, Menu, X } from "lucide-react"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-soft sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-xl">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EventHub
          </span>
        </a>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center space-x-1">
          <li>
            <a href="#" className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors">
              Начало
            </a>
          </li>
          <li>
            <a href="#" className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors">
              Събития
            </a>
          </li>
          <li>
            <a href="#" className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors">
              За нас
            </a>
          </li>
          <li>
            <a href="#" className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors">
              Контакти
            </a>
          </li>
          <li>
            <button className="ml-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:shadow-color transition-all hover:scale-105">
              Добави събитие
            </button>
          </li>
        </ul>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-primary hover:bg-pink-50 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white/95 backdrop-blur-sm">
          <ul className="flex flex-col px-4 py-4 space-y-2">
            <li>
              <a href="#" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                Начало
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                Събития
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                За нас
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                Контакти
              </a>
            </li>
            <li className="pt-2">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:shadow-color transition-all">
                Добави събитие
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}