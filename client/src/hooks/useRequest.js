import { useContext, useEffect, useState } from "react";
import UserContext from "../contexts/UserContext";

const baseUrl = import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:3030';

export default function useRequest(url, initialState) {
    const { user, isAuthenticated } = useContext(UserContext);
    const [data, setData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    const request = async (url, method, data, config = {}) => {
        const maxRetries = config.maxRetries || 0;
        const retryDelay = config.retryDelay || 1000;
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                let options = {};

                if (method) {
                    options.method = method;
                }

                if (data) {
                    options.headers = {
                        'content-type': 'application/json',
                    };

                    options.body = JSON.stringify(data);
                }

                if (config.accessToken || (isAuthenticated && user?.accessToken)) {
                    options.headers = {
                        ...options.headers,
                        'X-Authorization': config.accessToken || user?.accessToken || '',
                    }
                }

                const response = await fetch(`${baseUrl}${url}`, options);

                if (!response.ok) {
                    // Handle specific status codes
                    let errorMessage = response.statusText;
                    let errorType = 'unknown';

                    try {
                        const errorData = await response.json();
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        }
                    } catch {
                        // If response is not JSON, use statusText
                        errorMessage = response.statusText;
                    }

                    // Specific error messages based on status code
                    switch (response.status) {
                        case 400:
                            errorType = 'bad_request';
                            if (!errorMessage || errorMessage === 'Bad Request') {
                                errorMessage = 'Невалидна заявка. Моля, проверете въведените данни.';
                            }
                            break;
                        case 401:
                            errorType = 'unauthorized';
                            if (!errorMessage || errorMessage === 'Unauthorized') {
                                errorMessage = 'Не сте авторизирани. Моля, влезте в профила си.';
                            }
                            break;
                        case 403:
                            errorType = 'forbidden';
                            if (!errorMessage || errorMessage === 'Forbidden') {
                                errorMessage = 'Нямате достъп до този ресурс.';
                            }
                            break;
                        case 404:
                            errorType = 'not_found';
                            if (!errorMessage || errorMessage === 'Not Found') {
                                errorMessage = 'Ресурсът не е намерен.';
                            }
                            break;
                        case 409:
                            errorType = 'conflict';
                            if (!errorMessage || errorMessage === 'Conflict') {
                                errorMessage = 'Конфликт с текущото състояние.';
                            }
                            break;
                        case 500:
                            errorType = 'server_error';
                            if (!errorMessage || errorMessage === 'Internal Server Error') {
                                errorMessage = 'Вътрешна грешка на сървъра. Моля, опитайте по-късно.';
                            }
                            break;
                        default:
                            errorType = 'unknown';
                    }

                    const error = new Error(errorMessage);
                    error.status = response.status;
                    error.type = errorType;

                    // Don't retry for client errors (4xx), only for server errors (5xx) or network errors
                    if (response.status >= 400 && response.status < 500 && response.status !== 408) {
                        throw error;
                    }

                    // Retry for server errors or timeout
                    if (attempt < maxRetries && (response.status >= 500 || response.status === 408)) {
                        lastError = error;
                        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                        continue;
                    }

                    throw error;
                }

                if (response.status === 204) {
                    return {};
                }

                const result = await response.json();
                return result;
            } catch (err) {
                // Network errors or other fetch errors
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    const networkError = new Error('Проблем с мрежовата връзка. Моля, проверете интернет връзката си.');
                    networkError.status = 0;
                    networkError.type = 'network_error';

                    // Retry network errors
                    if (attempt < maxRetries) {
                        lastError = networkError;
                        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                        continue;
                    }

                    throw networkError;
                }

                // Re-throw if it's already a formatted error
                if (err.status) {
                    throw err;
                }

                // Format unknown errors
                const formattedError = new Error(err.message || 'Възникна неочаквана грешка.');
                formattedError.status = err.status || 0;
                formattedError.type = 'unknown';
                throw formattedError;
            }
        }

        // If we exhausted all retries, throw the last error
        throw lastError || new Error('Неуспешна заявка след няколко опита.');
    };

    useEffect(() => {
        if (!url) return;

        let isMounted = true;
        setIsLoading(true);

        request(url)
            .then(result => {
                if (isMounted) {
                    setData(result);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error('Request error:', err);
                    setIsLoading(false);
                    
                    // Handle specific error types
                    if (err.status === 404) {
                        // 404 errors are handled silently or by components
                        // Don't show alert for 404
                        return;
                    } else if (err.status === 401) {
                        // 401 - Unauthorized - redirect to login
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                        }
                        return;
                    } else if (err.status === 403) {
                        // 403 - Forbidden - show error but don't redirect
                        alert(err.message || 'Нямате достъп до този ресурс.');
                        return;
                    }
                    
                    // Show alert for other errors
                    alert(err.message || 'Възникна грешка при зареждане на данните');
                }
            });

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return {
        request,
        data,
        setData,
        isLoading,
    }
}

