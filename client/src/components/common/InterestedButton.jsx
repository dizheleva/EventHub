import { useState, useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { useUserContext } from "../../contexts/UserContext";
import useRequest from "../../hooks/useRequest";
import useToast from "../../hooks/useToast";

export default function InterestedButton({ eventId, variant = "default" }) {
    const { user, isAuthenticated } = useUserContext();
    const { showToast } = useToast();
    const [isInterested, setIsInterested] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get all interests for this event
    const urlParams = new URLSearchParams({
        where: `eventId="${eventId}"`
    });
    const { data: interests, setData: setInterests, request } = useRequest(
        `/data/interested?${urlParams.toString()}`,
        []
    );

    // Check if current user is interested
    useEffect(() => {
        if (isAuthenticated && user && Array.isArray(interests)) {
            const userInterest = interests.find(i => i._ownerId === user._id);
            setIsInterested(!!userInterest);
        } else {
            setIsInterested(false);
        }
    }, [interests, user, isAuthenticated]);

    // Calculate interest count
    const interestCount = useMemo(() => {
        return Array.isArray(interests) ? interests.length : 0;
    }, [interests]);

    // Get current user's interest ID
    const userInterestId = useMemo(() => {
        if (!isAuthenticated || !user || !Array.isArray(interests)) return null;
        const userInterest = interests.find(i => i._ownerId === user._id);
        return userInterest?._id || null;
    }, [interests, user, isAuthenticated]);

    const handleToggleInterest = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            showToast('info', 'Трябва да сте влезли в профила си, за да изразите интерес');
            return;
        }

        setIsLoading(true);

        try {
            if (isInterested) {
                // Remove interest
                if (userInterestId) {
                    await request(`/data/interested/${userInterestId}`, 'DELETE');
                } else {
                    // Fallback: delete by eventId
                    await request(`/data/interested?eventId=${eventId}`, 'DELETE');
                }
                
                // Update local state
                setInterests(prev => {
                    if (!Array.isArray(prev)) return [];
                    return prev.filter(i => i._ownerId !== user._id);
                });
                
                setIsInterested(false);
                showToast('success', 'Премахнахте интереса си към това събитие');
            } else {
                // Add interest
                const newInterest = await request('/data/interested', 'POST', { eventId });
                
                // Update local state
                setInterests(prev => {
                    if (!Array.isArray(prev)) return [newInterest];
                    return [...prev, newInterest];
                });
                
                setIsInterested(true);
                showToast('success', 'Изразихте интерес към това събитие');
            }
        } catch (err) {
            if (err.message?.includes('409') || err.message?.includes('Already interested')) {
                // Already interested, just update state
                setIsInterested(true);
            } else {
                showToast('error', 'Не може да се обнови интересът: ' + (err.message || 'Възникна грешка'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Variant styles
    const variantStyles = {
        default: {
            button: "inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all",
            buttonActive: "inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary rounded-xl hover:bg-primary/20 transition-all",
            icon: "w-5 h-5",
            text: "text-sm font-semibold"
        },
        card: {
            button: "inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all",
            buttonActive: "inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary rounded-lg hover:bg-primary/20 transition-all",
            icon: "w-4 h-4",
            text: "text-xs font-medium"
        },
        compact: {
            button: "inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all",
            buttonActive: "inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary rounded-lg hover:bg-primary/20 transition-all",
            icon: "w-4 h-4",
            text: "text-xs font-medium"
        }
    };

    const styles = variantStyles[variant] || variantStyles.default;

    return (
        <button
            onClick={handleToggleInterest}
            disabled={isLoading}
            className={`
                ${isInterested ? styles.buttonActive : styles.button}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={isInterested ? 'Премахни интерес' : 'Изрази интерес'}
        >
            <Heart 
                className={`
                    ${styles.icon} 
                    ${isInterested ? 'text-primary fill-primary' : 'text-gray-600'}
                    transition-colors
                `}
            />
            {variant !== 'compact' && (
                <span className={`
                    ${styles.text}
                    ${isInterested ? 'text-primary' : 'text-gray-700'}
                    hidden sm:inline
                `}>
                    {interestCount === 0 
                        ? 'Интересувам се' 
                        : interestCount === 1 
                            ? '1 човек се интересува' 
                            : `${interestCount} хора се интересуват`
                    }
                </span>
            )}
            {variant === 'compact' && interestCount > 0 && (
                <span className={`
                    ${styles.text}
                    ${isInterested ? 'text-primary' : 'text-gray-700'}
                    font-semibold
                `}>
                    {interestCount}
                </span>
            )}
        </button>
    );
}

