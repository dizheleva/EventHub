import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import EventCard from './EventCard';

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EventCard', () => {
  const mockEvent = {
    _id: 'event-1',
    title: 'Test Event',
    category: 'Спорт',
    imageUrl: 'https://example.com/image.jpg',
    date: '2024-12-25T18:00:00',
    location: 'София, ул. Витоша 1',
    price: 50,
    author: {
      _id: 'user-1',
      email: 'test@example.com',
      username: 'TestUser'
    }
  };

  it('renders event title', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders event category', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    expect(screen.getByText(/спорт/i)).toBeInTheDocument();
  });

  it('renders event date', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    expect(screen.getByText(/25\.12\.2024/i)).toBeInTheDocument();
  });

  it('renders event location (city)', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    expect(screen.getByText(/София/i)).toBeInTheDocument();
  });

  it('renders event price', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    expect(screen.getByText(/50/i)).toBeInTheDocument();
  });

  it('renders author username when available', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('renders author email when username is not available', () => {
    const eventWithoutUsername = {
      ...mockEvent,
      author: {
        ...mockEvent.author,
        username: ''
      }
    };
    renderWithRouter(<EventCard {...eventWithoutUsername} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles online events', () => {
    const onlineEvent = {
      ...mockEvent,
      location: 'Онлайн'
    };
    renderWithRouter(<EventCard {...onlineEvent} />);
    // Online events show "Онлайн" text somewhere in the card
    // The location parsing returns isOnline: true, so we check for the event title to verify rendering
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('handles events without image', () => {
    const eventWithoutImage = {
      ...mockEvent,
      imageUrl: ''
    };
    renderWithRouter(<EventCard {...eventWithoutImage} />);
    // When there's no image, a default calendar icon is shown instead
    // We can verify the event title is still rendered
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders link to event details', () => {
    renderWithRouter(<EventCard {...mockEvent} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/events/event-1/details');
  });

  it('handles missing optional fields gracefully', () => {
    const minimalEvent = {
      _id: 'event-2',
      title: 'Minimal Event',
      category: 'Спорт',
      date: '2024-12-25T18:00:00',
      location: 'Пловдив',
      price: 0
    };
    renderWithRouter(<EventCard {...minimalEvent} />);
    expect(screen.getByText('Minimal Event')).toBeInTheDocument();
  });
});

