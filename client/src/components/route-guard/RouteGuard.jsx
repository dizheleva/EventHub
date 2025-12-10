import { Navigate, Outlet } from "react-router";
import { useUserContext } from "../../contexts/UserContext";

export default function RouteGuard({ isGuestOnly = false }) {
    const { isAuthenticated } = useUserContext();

    if (isGuestOnly) {
        return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

