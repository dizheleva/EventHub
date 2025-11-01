export function Features() {
  const features = [
    {
      title: "Лесно откриване",
      desc: "Преглеждайте всички предстоящи събития на едно място.",
    },
    {
      title: "Добавяне на събития",
      desc: "Споделете свое събитие с другите потребители.",
    },
    {
      title: "Любими събития",
      desc: "Запазете събития, които искате да посетите.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-3xl font-semibold text-center mb-8">
        Основни функции
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 bg-white shadow rounded-2xl hover:shadow-lg transition"
          >
            <h3 className="text-xl font-medium mb-2 text-primary">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
