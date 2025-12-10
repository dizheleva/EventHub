import { useNavigate } from "react-router";
import useForm from "../../hooks/useForm";
import { useContext } from "react";
import UserContext from "../../contexts/UserContext";
import useToast from "../../hooks/useToast";

export default function Login() {
    const navigate = useNavigate();
    const { loginHandler } = useContext(UserContext);
    const { showToast } = useToast();

    const submitHandler = async ({ email, password }) => {
        if (!email || !password) {
            return showToast('error', 'Имейл и парола са задължителни!');
        }

        try {
            await loginHandler(email, password);
            showToast('success', 'Успешно влизане!');
            navigate('/');
        } catch (err) {
            showToast('error', err.message || 'Не може да влезете. Моля, проверете вашите данни.');
        }
    };

    const {
        register,
        formAction,
    } = useForm(submitHandler, {
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        formAction();
    };

    return (
        <section className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8 md:p-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Вход</h1>

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
                        <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Парола
                        </label>
                        <input 
                            type="password" 
                            id="login-password" 
                            {...register('password')} 
                            placeholder="Парола"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all"
                    >
                        Вход
                    </button>
                </form>
            </div>
        </section>
    );
}

