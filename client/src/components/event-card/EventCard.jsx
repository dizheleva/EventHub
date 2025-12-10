import { Link } from 'react-router';
import { Calendar, MapPin, User } from 'lucide-react';
import { getCategoryDisplay, formatEventPrice } from '../../utils/categories';

export default function EventCard({
    _id,
    title,
    category,
    imageUrl,
    date,
    location,
    price,
    author,
}) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleString('bg-BG', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    // Parse location to extract city and address
    // Format: "Град, Адрес" - градът е първата част, адресът е останалото
    const parseLocation = (loc) => {
        if (!loc) return { city: '', address: '' };
        if (loc.toLowerCase().includes('онлайн')) {
            return { city: '', address: '', isOnline: true };
        }
        const parts = loc.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            // Първата част е градът, останалото е адресът
            return { city: parts[0], address: parts.slice(1).join(', ') };
        }
        return { city: loc, address: '' };
    };

    const { city, address, isOnline } = parseLocation(location);

    return (
        <Link 
            to={`/events/${_id}/details`}
            className="block w-full bg-white rounded-2xl shadow-soft hover:shadow-color transition-all overflow-hidden group h-full flex flex-col cursor-pointer"
        >
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={title || 'Събитие'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                                fallback.classList.remove('hidden');
                            }
                        }}
                    />
                ) : null}
                <div className={`w-full h-full absolute inset-0 flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                    <Calendar className="w-16 h-16 text-primary/60" />
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                {/* Badges */}
                <div className="flex items-center justify-between mb-3">
                    {category && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {getCategoryDisplay(category)}
                        </span>
                    )}
                    {isOnline && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Онлайн
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {title || 'Без заглавие'}
                </h3>

                {/* City */}
                {city && (
                    <div className="mb-3">
                        <span className="text-sm text-gray-600 font-medium">{city}</span>
                    </div>
                )}

                {/* Date */}
                {date && (
                    <div className="mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">{formatDate(date)}</span>
                        </div>
                    </div>
                )}

                {/* Address */}
                {!isOnline && address && (
                    <div className="mb-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{address}</span>
                        </div>
                    </div>
                )}

                {/* Online indicator */}
                {isOnline && (
                    <div className="mb-3 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                            Онлайн събитие
                        </span>
                    </div>
                )}

                {/* Spacer - creates space between price and elements above */}
                <div className="flex-1"></div>

                {/* Price */}
                {price !== undefined && (
                    <div className="mb-3">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                            price === 0 
                                ? "bg-green-100 text-green-700" 
                                : "bg-yellow-100 text-yellow-700"
                        }`}>
                            {formatEventPrice(price)}
                        </span>
                    </div>
                )}

                {/* Author */}
                {author && author.email && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{author.username || author.email}</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}

