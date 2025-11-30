import { EventList } from "@/components/events/EventList"

export function EventsPage() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Всички събития</h2>
      <EventList />
    </section>
  );
}
