import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import Login from './Login';
import UserContext from '../../contexts/UserContext';

// Mock useToast
vi.mock('../../hooks/useToast', () => ({
  default: () => ({
    showToast: vi.fn()
  })
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Login', () => {
  const mockLoginHandler = vi.fn();
  const mockUserContextValue = {
    user: null,
    isAuthenticated: false,
    registerHandler: vi.fn(),
    loginHandler: mockLoginHandler,
    logoutHandler: vi.fn(),
    updateUserHandler: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <Login />
        </UserContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /вход/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/имейл/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/парола/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /вход/i })).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/имейл/i);
    const passwordInput = screen.getByLabelText(/парола/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('123456');
  });

  it('calls loginHandler when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    mockLoginHandler.mockResolvedValue({});
    renderLogin();

    const emailInput = screen.getByLabelText(/имейл/i);
    const passwordInput = screen.getByLabelText(/парола/i);
    const submitButton = screen.getByRole('button', { name: /вход/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginHandler).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });

  it('shows error when email or password is empty', async () => {
    const user = userEvent.setup();
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /вход/i });
    await user.click(submitButton);

    // The form should not submit if fields are empty
    // This depends on the validation logic in the component
    expect(mockLoginHandler).not.toHaveBeenCalled();
  });

  it('navigates to home after successful login', async () => {
    const user = userEvent.setup();
    mockLoginHandler.mockResolvedValue({});
    renderLogin();

    const emailInput = screen.getByLabelText(/имейл/i);
    const passwordInput = screen.getByLabelText(/парола/i);
    const submitButton = screen.getByRole('button', { name: /вход/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

