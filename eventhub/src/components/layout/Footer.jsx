import { memo } from "react";

const Footer = memo(function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <p className="text-xs text-gray-600 text-center leading-relaxed max-w-3xl mx-auto">
            Този уебсайт е каталог за събития. Ние не организираме или управляваме представените прояви. 
            Информацията е предоставена от организаторите и ние не носим отговорност за неточности или промени. 
            За актуални детайли и билети се обръщайте директно към официалните организатори.
          </p>
        </div>
        
        {/* Copyright */}
        <div className="text-center">            
          <p className="text-sm text-gray-500">
            Copyright © {new Date().getFullYear()} EventHub. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;

