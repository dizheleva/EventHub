import { useState } from "react"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-primary">
          EventHub
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-gray-700">
          <li>
            <a href="#" className="hover:text-primary transition">
              Начало
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-primary transition">
              Събития
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-primary transition">
              За нас
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-primary transition">
              Вход
            </a>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden">
            <ul className="flex flex-col items-center py-4 space-y-3">
              <li>
                <a href="#" className="hover:text-primary">
                  Начало
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Събития
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  За нас
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Вход
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
