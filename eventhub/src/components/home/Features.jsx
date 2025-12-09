import { memo } from "react";
import { Search, PlusCircle, Heart, MapPin, Users, Star } from "lucide-react"

const Features = memo(function Features() {
  const features = [
    {
      icon: Search,
      title: "Лесно откриване",
      desc: "Преглеждайте всички предстоящи събития на едно място. Филтрирайте по локация, дата и тип.",
      color: "primary",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: MapPin,
      title: "Близо до вас",
      desc: "Намерете събития в близост до вашата локация. Винаги знайте какво се случва наоколо.",
      color: "secondary",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: PlusCircle,
      title: "Добавяне на събития",
      desc: "Споделете свое събитие с другите потребители. Организирайте работилници и забавления.",
      color: "accent",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: Heart,
      title: "Любими събития",
      desc: "Запазете събития, които искате да посетите. Създайте персонализиран списък с предпочитания.",
      color: "success",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Users,
      title: "За всички",
      desc: "Събития подходящи за всички възрасти и интереси. Намерете нещо за всеки.",
      color: "sky",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Star,
      title: "Препоръчани събития",
      desc: "Открийте най-популярните и най-добре оценени събития в града.",
      color: "secondary",
      gradient: "from-yellow-400 to-amber-500",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Защо да изберете <span className="text-gradient">EventHub</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Всичко, от което се нуждаете, за да намерите перфектното събитие за вас
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-color transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                {/* Icon with gradient background */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.desc}
                </p>
                
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full rounded-tr-3xl`}></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
});

export default Features;
