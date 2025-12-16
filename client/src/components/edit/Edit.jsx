import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useForm from "../../hooks/useForm";
import useRequest from "../../hooks/useRequest";
import { CATEGORIES } from "../../utils/categories";

export default function Edit() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { data: event, request } = useRequest(`/data/events/${eventId}`, {});

    const editEventHandler = async (values) => {
        // Validation
        // Date validation - not in the past
        if (values.startDate || values.date) {
            const startDate = new Date(values.startDate || values.date);
            const now = new Date();
            if (startDate < now) {
                alert('Началната дата не може да бъде в миналото!');
                return;
            }
        }

        // Price validation - not negative
        const price = values.price ? Number(values.price) : 0;
        if (price < 0) {
            alert('Цената не може да бъде отрицателна!');
            return;
        }

        // URL validation for imageUrl
        if (values.imageUrl && values.imageUrl.trim()) {
            try {
                new URL(values.imageUrl);
            } catch {
                alert('Моля, въведете валиден URL за снимката!');
                return;
            }
        }

        // URL validation for websiteUrl
        if (values.websiteUrl && values.websiteUrl.trim()) {
            try {
                new URL(values.websiteUrl);
            } catch {
                alert('Моля, въведете валиден URL за официалната страница!');
                return;
            }
        }

        const data = {
            title: values.title,
            category: values.category,
            description: values.description || '',
            date: values.startDate || values.date, // Keep date for backward compatibility
            location: values.isOnline ? 'Онлайн' : (values.city ? (values.address ? `${values.address}, ${values.city}` : values.city) : values.location || ''),
            imageUrl: values.imageUrl || '',
            websiteUrl: values.websiteUrl || '',
            price: price,
            tags: values.tags || '',
        };

        try {
            await request(`/data/events/${eventId}`, 'PUT', data);

            navigate(`/events/${eventId}/details`);
        } catch (err) {
            alert(err.message);
        }
    };

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const {
        register,
        formAction,
        setValues,
        values,
    } = useForm(editEventHandler, {
        title: '',
        category: '',
        description: '',
        startDate: '',
        endDate: '',
        date: '',
        isOnline: false,
        address: '',
        city: '',
        location: '',
        imageUrl: '',
        websiteUrl: '',
        price: 0,
        tags: '',
    });

    useEffect(() => {
        if (!event || !event._id) return;

        // Parse location if it's a string
        let address = '';
        let city = '';
        let isOnline = false;
        
        if (event.location) {
            if (event.location.toLowerCase().includes('онлайн')) {
                isOnline = true;
            } else {
                // Try to parse address and city from location string
                const parts = event.location.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    address = parts.slice(0, -1).join(', ');
                    city = parts[parts.length - 1];
                } else {
                    city = event.location;
                }
            }
        }

        setValues({
            title: event.title || '',
            category: event.category || '',
            description: event.description || '',
            startDate: formatDateTimeLocal(event.date || event.startDate),
            endDate: formatDateTimeLocal(event.endDate),
            date: formatDateTimeLocal(event.date),
            isOnline: isOnline,
            address: address,
            city: city,
            location: event.location || '',
            imageUrl: event.imageUrl || '',
            websiteUrl: event.websiteUrl || '',
            price: event.price || 0,
            tags: Array.isArray(event.tags) ? event.tags.join(', ') : (event.tags || ''),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    const handleSubmit = (e) => {
        e.preventDefault();
        formAction();
    };

    const handleChange = (e) => {
        const { name, checked } = e.target;
        
        // If isOnline changes, clear location fields if going online
        if (name === 'isOnline' && checked) {
            setValues(prev => ({
                ...prev,
                isOnline: true,
                address: '',
                city: '',
            }));
        } else {
            register(name).onChange(e);
        }
    };

    const endDateMin = values.startDate || values.date;

    return (
        <section className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-soft p-6 md:p-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Редактирай събитие</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Основна информация</h3>
                        
                        <div>
                            <label htmlFor="eventTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                                Заглавие *
                            </label>
                            <input
                                type="text"
                                id="eventTitle"
                                {...register('title')}
                                placeholder="Въведете заглавие на събитието"
                                autoComplete="off"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                                Категория *
                            </label>
                            <select
                                id="category"
                                {...register('category')}
                                autoComplete="off"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Изберете категория</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Описание <span className="text-gray-500 text-xs">(по избор)</span>
                            </label>
                            <textarea
                                id="description"
                                {...register('description')}
                                rows="4"
                                placeholder="Въведете описание на събитието"
                                autoComplete="off"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900">График</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Начална дата и час *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="startDate"
                                    {...register('startDate')}
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Крайна дата и час <span className="text-gray-500 text-xs">(по избор)</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    {...register('endDate')}
                                    min={endDateMin}
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900">Локация</h3>
                        
                        <div className="flex items-center gap-4">
                            <label htmlFor="isOnline" className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="isOnline"
                                    {...register('isOnline')}
                                    checked={values.isOnline}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">Онлайн събитие</span>
                            </label>
                        </div>
                        
                        {!values.isOnline && (
                            <>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Град *
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        {...register('city')}
                                        placeholder="Въведете град"
                                        autoComplete="address-level2"
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Адрес
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        {...register('address')}
                                        placeholder="Въведете пълен адрес"
                                        autoComplete="street-address"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </>
                        )}
                        
                        {values.isOnline && (
                            <p className="text-sm text-gray-600">Събитието ще се проведе онлайн.</p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900">Билети</h3>
                        
                        <div>
                            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                                Цена (0 = безплатно)
                            </label>
                            <input
                                type="number"
                                id="price"
                                {...register('price')}
                                min="0"
                                step="0.01"
                                placeholder="0"
                                autoComplete="off"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                            Тагове <span className="text-gray-500 text-xs">(по избор)</span>
                        </label>
                        <input
                            type="text"
                            id="tags"
                            {...register('tags')}
                            placeholder="Разделете таговете със запетая (напр. музика, концерт, рок)"
                            autoComplete="off"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Media */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Медия</h3>
                        
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                                Снимка (URL) <span className="text-gray-500 text-xs">(по избор)</span>
                            </label>
                            <input
                                type="url"
                                id="imageUrl"
                                {...register('imageUrl')}
                                placeholder="https://example.com/image.jpg"
                                autoComplete="url"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="websiteUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                                Официална страница / Повече информация (URL) <span className="text-gray-500 text-xs">(по избор)</span>
                            </label>
                            <input
                                type="url"
                                id="websiteUrl"
                                {...register('websiteUrl')}
                                placeholder="https://example.com/event"
                                autoComplete="url"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => navigate(`/events/${eventId}/details`)}
                            className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all text-lg"
                        >
                            Отказ
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all text-lg"
                        >
                            Запази промените
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

