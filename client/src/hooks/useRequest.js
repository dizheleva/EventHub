import { useContext, useEffect, useState } from "react";
import UserContext from "../contexts/UserContext";

const baseUrl = import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:3030';

export default function useRequest(url, initialState) {
    const { user, isAuthenticated } = useContext(UserContext);
    const [data, setData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    const request = async (url, method, data, config = {}) => {
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
            // Try to parse error message from response
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                // If response is not JSON, use statusText
                errorMessage = response.statusText;
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {};
        }

        const result = await response.json();

        return result;
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
                    // Only show alert for non-404 errors
                    if (!err.message?.includes('404')) {
                        alert(err.message || 'Възникна грешка при зареждане на данните');
                    }
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

