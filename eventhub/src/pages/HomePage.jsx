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
            <span className="text-gray-900">Добре дошли в</span>
            <br />
            <span className="text-gradient">EventHub</span>
            <span className="text-6xl md:text-7xl lg:text-8xl"> 🎉</span>
          </h1>
          
          {/* Description */}
          <div className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            <p>
              Всеки ден някъде в България се случва нещо интересно – концерт, базар, работилница или семейно събитие..
            </p>
            <p>
            Нашата платформа събира всичко на едно място, за да помага на хората да намират вдъхновение и да се свързват с живота на своите градове и общности.
            </p>
            <p>
              Нека заедно направим свободното време по-цветно!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
