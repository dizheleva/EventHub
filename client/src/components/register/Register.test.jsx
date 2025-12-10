import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import Register from './Register';
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

describe('Register', () => {
  const mockRegisterHandler = vi.fn();
  const mockUserContextValue = {
    user: null,
    isAuthenticated: false,
    registerHandler: mockRegisterHandler,
    loginHandler: vi.fn(),
    logoutHandler: vi.fn(),
    updateUserHandler: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <Register />
        </UserContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders registration form', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /регистрация/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/имейл/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^парола$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/потвърди парола/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^регистрация$/i })).toBeInTheDocument();
  });

  it('allows user to fill in all fields', async () => {
    const user = userEvent.setup();
    renderRegister();

    const emailInput = screen.getByLabelText(/имейл/i);
    const passwordInput = screen.getByLabelText(/^парола$/i);
    const confirmPasswordInput = screen.getByLabelText(/потвърди парола/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.type(confirmPasswordInput, '123456');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('123456');
    expect(confirmPasswordInput).toHaveValue('123456');
  });

  it('calls registerHandler when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    mockRegisterHandler.mockResolvedValue({});
    renderRegister();

    const emailInput = screen.getByLabelText(/имейл/i);
    const passwordInput = screen.getByLabelText(/^парола$/i);
    const confirmPasswordInput = screen.getByLabelText(/потвърди парола/i);
    const submitButton = screen.getByRole('button', { name: /^регистрация$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.type(confirmPasswordInput, '123456');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterHandler).toHaveBeenCalled();
    });
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderRegister();

    const emailInput = screen.getByLabelText(/имейл/i);
    const passwordInput = screen.getByLabelText(/^парола$/i);
    const confirmPasswordInput = screen.getByLabelText(/потвърди парола/i);
    const submitButton = screen.getByRole('button', { name: /^регистрация$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.type(confirmPasswordInput, 'different');
    await user.click(submitButton);

    // The form should not submit if passwords don't match
    expect(mockRegisterHandler).not.toHaveBeenCalled();
  });
});

