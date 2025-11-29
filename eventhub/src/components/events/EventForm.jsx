import { useState } from "react";

export function EventForm({ onEventCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    imageUrl: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Грешка при създаване на събитие");

      const newEvent = await res.json();
      onEventCreated(newEvent);

      // Reset form
      setFormData({
        title: "",
        date: "",
        location: "",
        description: "",
        imageUrl: ""
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white shadow-md p-6 rounded-xl mb-10"
    >
      <h2 className="text-2xl font-bold">Добави събитие</h2>

      <input
        name="title"
        type="text"
        placeholder="Заглавие"
        className="w-full border p-2 rounded"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <input
        name="date"
        type="date"
        className="w-full border p-2 rounded"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <input
        name="location"
        type="text"
        placeholder="Локация"
        className="w-full border p-2 rounded"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <input
        name="imageUrl"
        type="text"
        placeholder="Снимка (URL)"
        className="w-full border p-2 rounded"
        value={formData.imageUrl}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Описание"
        className="w-full border p-2 rounded"
        rows="3"
        value={formData.description}
        onChange={handleChange}
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Създай
      </button>
    </form>
  );
}
