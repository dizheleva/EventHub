import { createContext, useContext } from "react";
import useRequest from "../hooks/useRequest";
import usePersistedState from "../hooks/usePersistedState";

const UserContext = createContext({
    isAuthenticated: false,
    user: {
        email: '',
        password: '',
        _createdOn: 0,
        _id: '',
        accessToken: ''
    },
    registerHandler() { },
    loginHandler() { },
    logoutHandler() { },
});

export function UserProvider({
    children,
}) {
    const [user, setUser] = usePersistedState(null, 'user');
    const { request } = useRequest();

    const registerHandler = async (email, password) => {
        const newUser = { email, password };

        // Register API call 
        const result = await request('/users/register', 'POST', newUser);

        // Login user after register
        setUser(result);
    };

    const loginHandler = async (email, password) => {
        const result = await request('/users/login', 'POST', { email, password });

        setUser(result);
    };

    const logoutHandler = () => {
        return request('/users/logout', 'GET', null, { accessToken: user.accessToken })
            .finally(() => setUser(null));
    };

    const updateUserHandler = (updatedUserData) => {
        if (user) {
            setUser({ ...user, ...updatedUserData });
        }
    };

    const userContextValues = {
        user,
        isAuthenticated: !!user?.accessToken,
        registerHandler,
        loginHandler,
        logoutHandler,
        updateUserHandler,
    };

    return (
        <UserContext.Provider value={userContextValues}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const contextData = useContext(UserContext);

    return contextData;
}

export default UserContext;

