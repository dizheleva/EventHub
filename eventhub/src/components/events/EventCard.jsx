export const EventCard = ({ title, date, organizer, imageUrl, address }) => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden transition hover:shadow-xl">
        <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
  
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
  
          <p className="text-sm text-slate-600">
            📅 Дата: {date}
          </p>
  
          <p className="text-sm">
            📍 {address.city}, {address.street} {address.streetNumber}
          </p>
  
          <p className="text-xs text-slate-500">
            Организатор: {organizer}
          </p>
        </div>
      </div>
    );
  };
  