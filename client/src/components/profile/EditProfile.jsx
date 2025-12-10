import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import useForm from "../../hooks/useForm";
import useRequest from "../../hooks/useRequest";
import { useUserContext } from "../../contexts/UserContext";
import { ArrowLeft } from "lucide-react";

/**
 * EditProfile - Edit user profile information
 * Only the profile owner can edit their own profile.
 */
export default function EditProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated, updateUserHandler } = useUserContext();
    const { data: users, setData: setUsers } = useRequest('/data/users', []);
    const { request } = useRequest();

    // Find profile user
    const profileUser = users && Array.isArray(users) 
        ? users.find(u => u._id === userId) 
        : null;

    // Check authorization
    useEffect(() => {
        if (!isAuthenticated || !currentUser) {
            navigate("/login");
            return;
        }

        if (currentUser._id !== userId) {
            alert("Нямате права да редактирате този профил.");
            navigate("/events");
            return;
        }
    }, [isAuthenticated, currentUser, userId, navigate]);

    const submitHandler = async (values) => {
        if (!profileUser) return;

        try {
            // Check if email is already taken by another user
            const emailExists = users.some(
                (u) => u.email === values.email && u._id !== userId
            );

            if (emailExists) {
                alert("Потребител с този имейл вече съществува");
                return;
            }

            // Prepare update data
            const updateData = {
                email: values.email.trim(),
                username: values.username?.trim() || '',
                avatarUrl: values.avatarUrl?.trim() || '',
            };

            // Only include password if it's provided AND matches confirmation
            if (values.password && values.password.trim().length > 0) {
                if (values.password !== values.confirmPassword) {
                    alert("Паролите не съвпадат. Моля, проверете отново.");
                    return;
                }
                // In a real app, you'd hash the password here
                // For now, we'll just store it (not recommended for production)
                updateData.password = values.password;
            }

            // Update user
            const updatedUser = await request(`/users/${userId}`, 'PUT', updateData);

            // Update local state
            setUsers(prev => {
                if (!Array.isArray(prev)) return prev;
                return prev.map(u => 
                    u._id === userId ? { ...u, ...updatedUser } : u
                );
            });

            // Update auth context with new user data (preserve accessToken)
            if (currentUser) {
                updateUserHandler({
                    email: updatedUser.email,
                    username: updatedUser.username,
                    avatarUrl: updatedUser.avatarUrl,
                });
            }

            // Update auth context - reload user data
            // The user will need to log in again if password was changed
            if (updateData.password) {
                alert("Паролата беше променена. Моля, влезте отново.");
                navigate("/login");
                return;
            }

            alert("Профилът беше обновен успешно!");
            navigate(`/profile/${userId}`);
        } catch (error) {
            alert(error.message || "Възникна грешка при обновяване на профила");
        }
    };

    const {
        register,
        formAction,
        values,
        setValues,
    } = useForm(submitHandler, {
        email: "",
        username: "",
        avatarUrl: "",
        password: "",
        confirmPassword: "",
    });

    // Pre-fill form when user data is loaded
    useEffect(() => {
        if (profileUser) {
            setValues({
                email: profileUser.email || "",
                username: profileUser.username || "",
                avatarUrl: profileUser.avatarUrl || "",
                password: "", // Password fields are always empty (not pre-filled for security)
                confirmPassword: "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        formAction();
    };

    if (!isAuthenticated || !currentUser) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-2xl text-gray-500 font-medium">Зареждане...</h3>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-2xl text-gray-500 font-medium">Потребителят не е намерен</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link 
                to={`/profile/${userId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Назад към профила</span>
            </Link>

            {/* Form Card */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900">Редактирай профил</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                            Потребителско име <span className="text-gray-500 text-xs">(по избор)</span>
                        </label>
                        <input
                            type="text"
                            id="username"
                            {...register("username")}
                            placeholder="Въведете потребителско име"
                            autoComplete="username"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Avatar URL Field */}
                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                            URL на аватар <span className="text-gray-500 text-xs">(по избор)</span>
                        </label>
                        <input
                            type="url"
                            id="avatarUrl"
                            {...register("avatarUrl")}
                            placeholder="https://example.com/avatar.jpg"
                            autoComplete="url"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Имейл *
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...register("email")}
                            placeholder="Въведете вашия имейл"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Нова парола <span className="text-gray-500 text-xs">(по избор)</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register("password")}
                            placeholder="Оставете празно, за да запазите текущата парола"
                            autoComplete="new-password"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Confirm Password Field - Only show if password is entered */}
                    {values.password && values.password.trim().length > 0 && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Повтори новата парола *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                {...register("confirmPassword")}
                                placeholder="Въведете паролата отново"
                                autoComplete="new-password"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/profile/${userId}`)}
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
            </article>
        </div>
    );
}

