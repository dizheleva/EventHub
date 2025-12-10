import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCreateForm from './EventCreateForm';
import UserContext from '../../contexts/UserContext';

// Mock useRequest
vi.mock('../../hooks/useRequest', () => ({
  default: () => ({
    request: vi.fn().mockResolvedValue({
      _id: 'new-event-1',
      title: 'Test Event',
      category: 'music'
    })
  })
}));

// Mock useToast
vi.mock('../../hooks/useToast', () => ({
  default: () => ({
    showToast: vi.fn()
  })
}));

describe('EventCreateForm', () => {
  const mockOnEventCreated = vi.fn();
  const mockOnCancel = vi.fn();
  const mockUser = {
    _id: 'user-1',
    email: 'test@example.com',
    username: 'TestUser'
  };

  const mockUserContextValue = {
    user: mockUser,
    isAuthenticated: true,
    registerHandler: vi.fn(),
    loginHandler: vi.fn(),
    logoutHandler: vi.fn(),
    updateUserHandler: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () => {
    return render(
      <UserContext.Provider value={mockUserContextValue}>
        <EventCreateForm
          onEventCreated={mockOnEventCreated}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      </UserContext.Provider>
    );
  };

  it('renders event creation form', () => {
    renderForm();
    expect(screen.getByLabelText(/заглавие/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/категория/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/начална дата/i)).toBeInTheDocument();
  });

  it('allows user to fill in event title', async () => {
    const user = userEvent.setup();
    renderForm();

    const titleInput = screen.getByLabelText(/заглавие/i);
    await user.type(titleInput, 'My Test Event');

    expect(titleInput).toHaveValue('My Test Event');
  });

  it('allows user to select category', async () => {
    const user = userEvent.setup();
    renderForm();

    const categorySelect = screen.getByLabelText(/категория/i);
    await user.selectOptions(categorySelect, 'Спорт');

    expect(categorySelect).toHaveValue('Спорт');
  });

  it('allows user to fill in description', async () => {
    const user = userEvent.setup();
    renderForm();

    const descriptionTextarea = screen.getByPlaceholderText(/въведете описание/i);
    await user.type(descriptionTextarea, 'This is a test event description');

    expect(descriptionTextarea).toHaveValue('This is a test event description');
  });

  it('shows cancel button', () => {
    renderForm();
    const cancelButton = screen.getByRole('button', { name: /отказ/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderForm();

    const cancelButton = screen.getByRole('button', { name: /отказ/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders submit button', () => {
    renderForm();
    const submitButton = screen.getByRole('button', { name: /създай/i });
    expect(submitButton).toBeInTheDocument();
  });
});

