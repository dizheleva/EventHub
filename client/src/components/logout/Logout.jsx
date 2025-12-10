import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUserContext } from "../../contexts/UserContext";
import useToast from "../../hooks/useToast";

export default function Logout() {
    const navigate = useNavigate();
    const { logoutHandler } = useUserContext();
    const { showToast } = useToast();

    useEffect(() => {
        logoutHandler()
            .then(() => {
                showToast('success', 'Успешно излизане!');
                navigate('/');
            })
            .catch(() => {
                navigate('/');
            });
    }, [logoutHandler, navigate, showToast]);

    return null;
}

