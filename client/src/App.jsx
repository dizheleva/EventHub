import { Route, Routes } from "react-router"

import { useUserContext } from "./contexts/UserContext"

import Header from "./components/header/Header"
import Footer from "./components/footer/Footer"
import Home from "./components/home/Home"
import Catalog from "./components/catalog/Catalog"
import MyEvents from "./components/my-events/MyEvents"
import Profile from "./components/profile/Profile"
import Details from "./components/details/Details"
import EventCreate from "./components/event-create/EventCreate"
import Register from "./components/register/Register"
import Login from "./components/login/Login"
import Logout from "./components/logout/Logout"
import Edit from "./components/edit/Edit"
import RouteGuard from "./components/route-guard/RouteGuard"
import NotFound from "./components/common/NotFound"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function App() {
    const { user } = useUserContext();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Catalog />} />
                    <Route path="/events/:eventId/details" element={<Details user={user} />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route element={<RouteGuard />}>
                        <Route path="/my-events" element={<MyEvents />} />
                        <Route path="/events/:eventId/edit" element={<Edit />} />
                        <Route path="/events/create" element={<EventCreate />} />
                    </Route>
                    <Route element={<RouteGuard isGuestOnly />}>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                    </Route>
                    <Route element={<RouteGuard />}>
                        <Route path="/logout" element={<Logout />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}

export default App

