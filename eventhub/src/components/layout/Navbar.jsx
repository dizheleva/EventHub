import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { CalendarDays, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if current path is active for styling
  const isActive = (path) => location.pathname === path

  function handleLogout() {
    logout()
    navigate("/")
    setMenuOpen(false)
  }

  return (
    <header className="border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-soft sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-xl">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EventHub
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center space-x-1">
          <li>
            <Link to="/events" className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors">
              Събития
            </Link>
          </li>
          
          {/* My Events link - only visible when authenticated */}
          {isAuthenticated && (
            <li>
              <Link 
                to="/my-events" 
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  isActive("/my-events")
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-gray-700 hover:bg-pink-50 hover:text-primary"
                }`}
              >
                Моите събития
              </Link>
            </li>
          )}
          
          {/* Auth buttons */}
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors">
                  Вход
                </Link>
              </li>
              <li>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-color transition-all">
                  Регистрация
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to={`/profile/${user.id}`}
                  className={`px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors ${
                    isActive(`/profile/${user.id}`) || isActive(`/profile/${user.id}/edit`)
                      ? "bg-primary/10 text-primary font-semibold"
                      : ""
                  }`}
                >
                  Добре дошли, <span className="text-primary font-semibold">{user?.username || user?.email}</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors"
                >
                  Изход
                </button>
              </li>
            </>
          )}
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
              <Link to="/events" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                Събития
              </Link>
            </li>
            
            {/* My Events link - only visible when authenticated */}
            {isAuthenticated && (
              <li>
                <Link 
                  to="/my-events" 
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive("/my-events")
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-gray-700 hover:bg-pink-50 hover:text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Моите събития
                </Link>
              </li>
            )}
            
            {/* Auth buttons */}
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/login" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                    Вход
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="block px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-color transition-all" onClick={() => setMenuOpen(false)}>
                    Регистрация
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to={`/profile/${user.id}`}
                    className={`block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors ${
                      isActive(`/profile/${user.id}`) || isActive(`/profile/${user.id}/edit`)
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Добре дошли, <span className="text-primary font-semibold">{user?.username || user?.email}</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 hover:text-primary transition-colors"
                  >
                    Изход
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}