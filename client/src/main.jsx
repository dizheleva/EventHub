import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { UserProvider } from './contexts/UserContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <UserProvider>
                <App />
            </UserProvider>
        </BrowserRouter>
    </ErrorBoundary>
)

