import { Navbar } from "./Navbar"

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="text-center py-6 text-sm text-gray-500 border-t">
        © {new Date().getFullYear()} EventHub. Всички права запазени.
      </footer>
    </div>
  )
}