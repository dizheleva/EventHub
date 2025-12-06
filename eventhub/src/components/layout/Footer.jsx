export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">            
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} EventHub. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}

