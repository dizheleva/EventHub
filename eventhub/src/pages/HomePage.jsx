import { MapPin, Calendar } from "lucide-react"

export function HomePage() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-xl"></div>
        
        <div className="relative text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gradient">Открийте</span>
            <br />
            <span className="text-gray-900">събития около вас</span>
            <span className="text-6xl md:text-7xl lg:text-8xl"> 🎉</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Вашето място за откриване и споделяне на събития в града. 
            <br className="hidden md:block" />
            Концерти, работилници, фестивали и много повече за всеки.
          </p>
          
          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-soft">
              <MapPin className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Локации</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-soft">
              <Calendar className="w-6 h-6 text-secondary" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-600">Събития</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
