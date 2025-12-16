import useForm from "../../hooks/useForm";
import useRequest from "../../hooks/useRequest";
import useToast from "../../hooks/useToast";
import { CATEGORIES } from "../../utils/categories";

export default function EventCreateForm({ onEventCreated, onCancel, isSubmitting }) {
    const { request } = useRequest();
    const { showToast } = useToast();

    const createEventHandler = async (values) => {
        // Validation
        // Date validation - not in the past
        if (values.startDate) {
            const startDate = new Date(values.startDate);
            const now = new Date();
            if (startDate < now) {
                showToast('error', 'Началната дата не може да бъде в миналото!');
                return;
            }
        }

        // Price validation - not negative
        const price = values.price ? Number(values.price) : 0;
        if (price < 0) {
            showToast('error', 'Цената не може да бъде отрицателна!');
            return;
        }

        // URL validation for imageUrl
        if (values.imageUrl && values.imageUrl.trim()) {
            try {
                new URL(values.imageUrl);
            } catch {
                showToast('error', 'Моля, въведете валиден URL за снимката!');
                return;
            }
        }

        // URL validation for websiteUrl
        if (values.websiteUrl && values.websiteUrl.trim()) {
            try {
                new URL(values.websiteUrl);
            } catch {
                showToast('error', 'Моля, въведете валиден URL за официалната страница!');
                return;
            }
        }

        const data = {
            title: values.title,
            category: values.category,
            description: values.description || '',
            date: values.startDate,
            location: values.isOnline ? 'Онлайн' : (values.city ? (values.address ? `${values.city}, ${values.address}` : values.city) : ''),
            imageUrl: values.imageUrl || '',
            websiteUrl: values.websiteUrl || '',
            price: price,
            tags: values.tags || '',
        };

        try {
            const result = await request('/data/events', 'POST', data);
            
            if (result && result._id) {
                showToast('success', 'Събитието беше създадено успешно!');
                if (onEventCreated) {
                    await onEventCreated(result);
                }
            } else {
                showToast('error', 'Грешка при създаване на събитието: Невалиден отговор от сървъра');
            }
        } catch (err) {
            showToast('error', err.message || 'Грешка при създаване на събитието');
            throw err;
        }
    };

    const {
        register,
        formAction,
        values,
        setValues,
    } = useForm(createEventHandler, {
        title: '',
        category: '',
        description: '',
        startDate: '',
        endDate: '',
        isOnline: false,
        address: '',
        city: '',
        imageUrl: '',
        websiteUrl: '',
        price: 0,
        tags: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        formAction();
    };

    const handleChange = (e) => {
        const { name, checked } = e.target;
        
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

    const minDate = new Date().toISOString().slice(0, 16);
    const endDateMin = values.startDate || minDate;

    return (
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
                        {...register('description')} 
                        id="description" 
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
                            min={minDate}
                            autoComplete="off"
                            required
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

            <div className="flex gap-4 pt-4">
                <button 
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Отказ
                </button>
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Създаване...' : 'Създай събитие'}
                </button>
            </div>
        </form>
    );
}

