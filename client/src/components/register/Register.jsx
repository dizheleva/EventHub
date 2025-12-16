import { useNavigate } from "react-router";
import useForm from "../../hooks/useForm";
import { useContext } from "react";
import UserContext from "../../contexts/UserContext";
import useToast from "../../hooks/useToast";

export default function Register() {
    const navigate = useNavigate();
    const { registerHandler } = useContext(UserContext);
    const { showToast } = useToast();

    const registerSubmitHandler = async (values) => {
        const { email, password, confirmPassword } = values;

        // Validation
        if (!email || !password) {
            return showToast('error', 'Имейл и парола са задължителни!');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return showToast('error', 'Моля, въведете валиден имейл адрес!');
        }

        // Password length validation
        if (password.length < 6) {
            return showToast('error', 'Паролата трябва да бъде поне 6 символа!');
        }

        if (password !== confirmPassword) {
            return showToast('error', 'Паролите не съвпадат!');
        }

        try {
            // Register User
            await registerHandler(email, password);
            showToast('success', 'Успешна регистрация!');
            navigate('/');
        } catch (err) {
            showToast('error', err.message || 'Възникна грешка при регистрация');
        }
    };

    const {
        register,
        formAction,
    } = useForm(registerSubmitHandler, {
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        formAction();
    };

    return (
        <section className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8 md:p-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Регистрация</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Имейл
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            {...register('email')} 
                            placeholder="Вашият имейл"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Парола
                        </label>
                        <input 
                            type="password" 
                            id="register-password" 
                            {...register('password')} 
                            placeholder="Парола"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Потвърди парола
                        </label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            {...register('confirmPassword')} 
                            placeholder="Повтори парола"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all"
                    >
                        Регистрация
                    </button>
                </form>
            </div>
        </section>
    );
}

